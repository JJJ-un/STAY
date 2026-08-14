-- 해외 반도체 8대 핵심 종목 초기 데이터 (시세 데이터는 한투 API 연동 전 0으로 초기화)
INSERT INTO stocks (name, ticker, current_price, change_price, change_rate, volume, market_cap, created_at, updated_at)
VALUES 
('엔비디아 (NVIDIA)', 'NVDA', 0.0000, 0.0000, 0.00, 0, 0, NOW(), NOW()),
('AMD (Advanced Micro Devices)', 'AMD', 0.0000, 0.0000, 0.00, 0, 0, NOW(), NOW()),
('TSMC (Taiwan Semiconductor)', 'TSM', 0.0000, 0.0000, 0.00, 0, 0, NOW(), NOW()),
('브로드컴 (Broadcom)', 'AVGO', 0.0000, 0.0000, 0.00, 0, 0, NOW(), NOW()),
('인텔 (Intel)', 'INTC', 0.0000, 0.0000, 0.00, 0, 0, NOW(), NOW()),
('ASML (ASML Holding)', 'ASML', 0.0000, 0.0000, 0.00, 0, 0, NOW(), NOW()),
('퀄컴 (Qualcomm)', 'QCOM', 0.0000, 0.0000, 0.00, 0, 0, NOW(), NOW()),
('마이크론 테크놀로지 (Micron)', 'MU', 0.0000, 0.0000, 0.00, 0, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();
