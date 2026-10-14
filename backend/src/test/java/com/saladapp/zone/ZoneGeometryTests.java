package com.saladapp.zone;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class ZoneGeometryTests {
    @Test
    void acceptsValidBoundaryAndExistingRequestsWithoutBoundary() {
        assertDoesNotThrow(() -> ZoneGeometry.validate(null));
        assertDoesNotThrow(() -> ZoneGeometry.validate(List.of(
                List.of(37.50, 127.00), List.of(37.52, 127.00), List.of(37.52, 127.03))));
    }

    @Test
    void rejectsCrossingLinesAndZeroArea() {
        assertThrows(IllegalArgumentException.class, () -> ZoneGeometry.validate(List.of(
                List.of(37.50, 127.00), List.of(37.52, 127.03),
                List.of(37.50, 127.03), List.of(37.52, 127.00))));
        assertThrows(IllegalArgumentException.class, () -> ZoneGeometry.validate(List.of(
                List.of(37.50, 127.00), List.of(37.51, 127.01), List.of(37.52, 127.02))));
    }

    @Test
    void rejectsInvalidCoordinatesAndTooFewPoints() {
        assertThrows(IllegalArgumentException.class, () -> ZoneGeometry.validate(List.of(
                List.of(37.50, 127.00), List.of(37.51, 127.01))));
        assertThrows(IllegalArgumentException.class, () -> ZoneGeometry.validate(List.of(
                List.of(91.0, 127.00), List.of(37.51, 127.01), List.of(37.52, 127.02))));
    }
}
