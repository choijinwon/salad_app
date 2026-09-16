package com.saladapp.address;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.saladapp.address.dto.AddressSearchItem;
import com.saladapp.address.dto.AddressSearchResponse;
import com.saladapp.common.BusinessRuleException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class AddressSearchService {

    private static final List<AddressSearchItem> DEMO_ADDRESSES = List.of(
            new AddressSearchItem("서울특별시 강남구 테헤란로 123", "서울특별시 강남구 역삼동 123", "06134", "서울특별시", "강남구", "역삼동", "상세주소를 입력해주세요."),
            new AddressSearchItem("서울특별시 서초구 신반포로 45", "서울특별시 서초구 반포동 45", "06500", "서울특별시", "서초구", "반포동", "동/호수를 입력해주세요."),
            new AddressSearchItem("서울특별시 송파구 올림픽로 300", "서울특별시 송파구 신천동 29", "05551", "서울특별시", "송파구", "신천동", "공동현관 정보를 요청사항에 입력해주세요."),
            new AddressSearchItem("서울특별시 마포구 월드컵북로 400", "서울특별시 마포구 상암동 1605", "03925", "서울특별시", "마포구", "상암동", "회사명 또는 층수를 입력해주세요.")
    );

    private final String baseUrl;
    private final String confmKey;
    private final boolean enabled;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public AddressSearchService(
            @Value("${juso.api.base-url}") String baseUrl,
            @Value("${juso.api.confm-key}") String confmKey,
            @Value("${juso.api.enabled}") boolean enabled,
            ObjectMapper objectMapper
    ) {
        this.baseUrl = baseUrl;
        this.confmKey = confmKey;
        this.enabled = enabled;
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = objectMapper;
    }

    public AddressSearchResponse search(String keyword, int page, int size) {
        String trimmedKeyword = keyword == null ? "" : keyword.trim();
        if (trimmedKeyword.length() < 2) {
            throw new BusinessRuleException("주소 검색어는 2글자 이상 입력해주세요.");
        }
        int currentPage = Math.max(page, 1);
        int countPerPage = Math.max(1, Math.min(size, 30));

        if (!enabled || confmKey == null || confmKey.isBlank()) {
            return searchDemo(trimmedKeyword, currentPage, countPerPage);
        }

        try {
            return searchJuso(trimmedKeyword, currentPage, countPerPage);
        } catch (IOException exception) {
            throw new BusinessRuleException("주소 API 응답을 처리하지 못했습니다.");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new BusinessRuleException("주소 API 요청이 중단되었습니다.");
        }
    }

    private AddressSearchResponse searchDemo(String keyword, int currentPage, int countPerPage) {
        String normalized = keyword.replaceAll("\\s+", "");
        List<AddressSearchItem> addresses = DEMO_ADDRESSES.stream()
                .filter(address -> address.roadAddress().replaceAll("\\s+", "").contains(normalized)
                        || address.jibunAddress().replaceAll("\\s+", "").contains(normalized)
                        || address.sggNm().contains(keyword)
                        || address.emdNm().contains(keyword))
                .limit(countPerPage)
                .toList();
        return new AddressSearchResponse("DEMO", addresses.size(), currentPage, countPerPage, addresses);
    }

    private AddressSearchResponse searchJuso(String keyword, int currentPage, int countPerPage) throws IOException, InterruptedException {
        String requestUrl = baseUrl
                + "?confmKey=" + encode(confmKey)
                + "&currentPage=" + currentPage
                + "&countPerPage=" + countPerPage
                + "&keyword=" + encode(keyword)
                + "&resultType=json"
                + "&addInfoYn=Y";
        HttpRequest request = HttpRequest.newBuilder(URI.create(requestUrl)).GET().build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new BusinessRuleException("주소 API 호출에 실패했습니다.");
        }

        JsonNode root = objectMapper.readTree(response.body()).path("results");
        JsonNode common = root.path("common");
        String errorCode = common.path("errorCode").asText("0");
        if (!"0".equals(errorCode)) {
            throw new BusinessRuleException(common.path("errorMessage").asText("주소 검색에 실패했습니다."));
        }

        List<AddressSearchItem> addresses = new ArrayList<>();
        root.path("juso").forEach(node -> addresses.add(toAddressItem(node)));
        return new AddressSearchResponse(
                "JUSO",
                common.path("totalCount").asInt(addresses.size()),
                common.path("currentPage").asInt(currentPage),
                common.path("countPerPage").asInt(countPerPage),
                addresses
        );
    }

    private AddressSearchItem toAddressItem(JsonNode node) {
        return new AddressSearchItem(
                node.path("roadAddr").asText(""),
                node.path("jibunAddr").asText(""),
                node.path("zipNo").asText(""),
                node.path("siNm").asText(""),
                node.path("sggNm").asText(""),
                node.path("emdNm").asText(""),
                node.path("roadAddrPart2").asText("")
        );
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
