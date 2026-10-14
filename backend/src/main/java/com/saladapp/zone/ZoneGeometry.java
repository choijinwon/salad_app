package com.saladapp.zone;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;

import java.util.List;

final class ZoneGeometry {
    private ZoneGeometry() { }

    static void validate(List<List<Double>> boundary) {
        if (boundary == null) return;
        if (boundary.size() < 3 || boundary.size() > 200) {
            throw new IllegalArgumentException("경계점은 3개 이상 200개 이하로 지정해주세요.");
        }
        Coordinate[] coordinates = new Coordinate[boundary.size() + 1];
        for (int i = 0; i < boundary.size(); i++) {
            List<Double> point = boundary.get(i);
            if (point == null || point.size() != 2 || point.get(0) == null || point.get(1) == null
                    || !Double.isFinite(point.get(0)) || !Double.isFinite(point.get(1))
                    || Math.abs(point.get(0)) > 90 || Math.abs(point.get(1)) > 180) {
                throw new IllegalArgumentException("올바른 위도와 경도를 입력해주세요.");
            }
            coordinates[i] = new Coordinate(point.get(1), point.get(0));
        }
        if (boundary.stream().distinct().count() != boundary.size()) {
            throw new IllegalArgumentException("중복된 경계점이 있습니다.");
        }
        coordinates[boundary.size()] = coordinates[0].copy();
        var polygon = new GeometryFactory().createPolygon(coordinates);
        if (!polygon.isValid() || polygon.getArea() < 5e-11) {
            throw new IllegalArgumentException("경계선이 교차하거나 배송 범위의 면적이 없습니다.");
        }
    }
}
