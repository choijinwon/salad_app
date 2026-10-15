package com.saladapp.delivery;

import com.saladapp.customer.ProfileRepository;
import com.saladapp.customer.SubscriptionRepository;
import com.saladapp.zone.DeliveryZoneRepository;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DeliveryPeriodTests {
    private final DeliveryScheduleRepository repository = mock(DeliveryScheduleRepository.class);
    private final DeliveryService service = new DeliveryService(repository, mock(ProfileRepository.class), mock(SubscriptionRepository.class), mock(DeliveryZoneRepository.class));

    @Test
    void queriesBothEndpointsAcrossMonthBoundaries() {
        LocalDate from = LocalDate.of(2025, 12, 31);
        LocalDate to = LocalDate.of(2026, 1, 31);
        when(repository.findByDeliveryDateBetweenOrderByDeliveryDateAscRouteOrderAsc(from, to)).thenReturn(List.of());
        assertTrue(service.getByPeriod(from, to).isEmpty());
        verify(repository).findByDeliveryDateBetweenOrderByDeliveryDateAscRouteOrderAsc(from, to);
    }

    @Test
    void rejectsReverseAndExcessiveRangesBeforeQuerying() {
        assertThrows(IllegalArgumentException.class, () -> service.getByPeriod(LocalDate.of(2026, 10, 31), LocalDate.of(2026, 10, 1)));
        assertThrows(IllegalArgumentException.class, () -> service.getByPeriod(LocalDate.of(2024, 1, 1), LocalDate.of(2025, 1, 1)));
        assertThrows(IllegalArgumentException.class, () -> service.getByPeriod(null, LocalDate.now()));
        verifyNoInteractions(repository);
    }
}
