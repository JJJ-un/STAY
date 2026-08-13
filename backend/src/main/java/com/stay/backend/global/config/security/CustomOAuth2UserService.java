package com.stay.backend.global.config.security;

import com.stay.backend.domain.user.entity.AuthProvider;
import com.stay.backend.domain.user.entity.User;
import com.stay.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        if (!"google".equalsIgnoreCase(registrationId)) {
            throw new OAuth2AuthenticationException("지원하지 않는 소셜 로그인 제공자입니다: " + registrationId);
        }

        GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(oAuth2User.getAttributes());

        String providerId = userInfo.getProviderId();
        String email = userInfo.getEmail();
        String nickname = userInfo.getNickname();
        String profileImageUrl = userInfo.getProfileImageUrl();

        User user = userRepository.findByAuthProviderAndProviderId(AuthProvider.GOOGLE, providerId)
                .orElseGet(() -> userRepository.findByEmail(email)
                        .orElseGet(() -> saveNewUser(email, nickname, profileImageUrl, providerId)));

        return new CustomUserDetails(user, oAuth2User.getAttributes());
    }

    private User saveNewUser(String email, String nickname, String profileImageUrl, String providerId) {
        log.info("신규 구글 소셜 회원 가입 진행: email={}", email);
        User newUser = User.builder()
                .email(email)
                .nickname(nickname != null ? nickname : "User_" + providerId.substring(0, 6))
                .profileImageUrl(profileImageUrl)
                .authProvider(AuthProvider.GOOGLE)
                .providerId(providerId)
                .build();
        return userRepository.save(newUser);
    }
}
