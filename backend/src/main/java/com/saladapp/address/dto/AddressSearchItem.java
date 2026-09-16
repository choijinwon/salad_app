package com.saladapp.address.dto;

public record AddressSearchItem(
        String roadAddress,
        String jibunAddress,
        String zipNo,
        String siNm,
        String sggNm,
        String emdNm,
        String detailHint
) {
}
