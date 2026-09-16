package com.saladapp.customer;

import com.saladapp.common.enums.UserRole;
import com.saladapp.customer.dto.CustomerRegistrationResponse;
import com.saladapp.customer.dto.CustomerResponse;
import com.saladapp.customer.dto.ManualCustomerRequest;
import com.saladapp.customer.dto.SubscriptionResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CustomerService {

    private static final int DEFAULT_UNIT_PRICE = 8900;

    private final PasswordEncoder passwordEncoder;
    private final ProfileRepository profileRepository;
    private final SubscriptionRepository subscriptionRepository;

    public CustomerService(
            PasswordEncoder passwordEncoder,
            ProfileRepository profileRepository,
            SubscriptionRepository subscriptionRepository
    ) {
        this.passwordEncoder = passwordEncoder;
        this.profileRepository = profileRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> getCustomers() {
        return profileRepository.findByRole(UserRole.CUSTOMER)
                .stream()
                .map(CustomerResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SubscriptionResponse> getSubscriptions(UUID customerId) {
        return subscriptionRepository.findByCustomerId(customerId)
                .stream()
                .map(SubscriptionResponse::from)
                .toList();
    }

    @Transactional
    public CustomerRegistrationResponse createManualCustomer(ManualCustomerRequest request) {
        Profile customer = new Profile(
                UUID.randomUUID(),
                UserRole.CUSTOMER,
                request.name(),
                request.phone(),
                request.email(),
                encodePassword(request.password()),
                request.birthdate(),
                request.address(),
                request.zoneId()
        );
        Profile savedCustomer = profileRepository.save(customer);

        int unitPrice = request.unitPrice() > 0 ? request.unitPrice() : DEFAULT_UNIT_PRICE;
        Subscription subscription = new Subscription(
                UUID.randomUUID(),
                savedCustomer.getId(),
                request.orderSource(),
                request.totalCount(),
                unitPrice,
                request.startDate()
        );
        Subscription savedSubscription = subscriptionRepository.save(subscription);

        return new CustomerRegistrationResponse(
                savedCustomer.getId(),
                savedSubscription.getId(),
                savedCustomer.getUniqueCode()
        );
    }

    private String encodePassword(String password) {
        if (password == null || password.isBlank()) {
            return null;
        }
        return passwordEncoder.encode(password);
    }
}
