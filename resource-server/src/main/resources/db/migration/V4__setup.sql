

-- =================================================================================
-- SEED DATA: 10 USERS (Auto-generating UUIDs with Subqueries)
-- Default Password for all users: password
-- BCrypt Hash used: $2a$10$VRtgk3dEMm3NJysOyf6XDuUtmhSBpvX88w2pEx/.xfy/Qe310f7vK
-- =================================================================================

-- 1. Alice Smith
INSERT INTO identities (login_id, password_hash, is_active)
VALUES ('VRD-10163189587401', '$2a$10$VRtgk3dEMm3NJysOyf6XDuUtmhSBpvX88w2pEx/.xfy/Qe310f7vK', true);

INSERT INTO users (identity_id, profile_id, full_name, authorities)
VALUES (
           (SELECT identity_id FROM identities WHERE login_id = 'VRD-10163189587401'),
           'VRD-10163189587401', 'Alice Smith', ARRAY['USER']::VARCHAR[]
       );

-- 2. Brandon Lee
INSERT INTO identities (login_id, password_hash, is_active)
VALUES ('VRD-10163189587402', '$2a$10$VRtgk3dEMm3NJysOyf6XDuUtmhSBpvX88w2pEx/.xfy/Qe310f7vK', true);

INSERT INTO users (identity_id, profile_id, full_name, authorities)
VALUES (
           (SELECT identity_id FROM identities WHERE login_id = 'VRD-10163189587402'),
           'VRD-10163189587402', 'Brandon Lee', ARRAY['USER']::VARCHAR[]
       );

-- 3. Chloe Davis
INSERT INTO identities (login_id, password_hash, is_active)
VALUES ('VRD-10163189587403', '$2a$10$VRtgk3dEMm3NJysOyf6XDuUtmhSBpvX88w2pEx/.xfy/Qe310f7vK', true);

INSERT INTO users (identity_id, profile_id, full_name, authorities)
VALUES (
           (SELECT identity_id FROM identities WHERE login_id = 'VRD-10163189587403'),
           'VRD-10163189587403', 'Chloe Davis', ARRAY['USER']::VARCHAR[]
       );

-- 4. Daniel Craig
INSERT INTO identities (login_id, password_hash, is_active)
VALUES ('VRD-10163189587404', '$2a$10$VRtgk3dEMm3NJysOyf6XDuUtmhSBpvX88w2pEx/.xfy/Qe310f7vK', true);

INSERT INTO users (identity_id, profile_id, full_name, authorities)
VALUES (
           (SELECT identity_id FROM identities WHERE login_id = 'VRD-10163189587404'),
           'VRD-10163189587404', 'Daniel Craig', ARRAY['USER']::VARCHAR[]
       );

-- 5. Evelyn Harper
INSERT INTO identities (login_id, password_hash, is_active)
VALUES ('VRD-10163189587405', '$2a$10$VRtgk3dEMm3NJysOyf6XDuUtmhSBpvX88w2pEx/.xfy/Qe310f7vK', true);

INSERT INTO users (identity_id, profile_id, full_name, authorities)
VALUES (
           (SELECT identity_id FROM identities WHERE login_id = 'VRD-10163189587405'),
           'VRD-10163189587405', 'Evelyn Harper', ARRAY['USER']::VARCHAR[]
       );

-- 6. Felix Vance
INSERT INTO identities (login_id, password_hash, is_active)
VALUES ('VRD-10163189587406', '$2a$10$VRtgk3dEMm3NJysOyf6XDuUtmhSBpvX88w2pEx/.xfy/Qe310f7vK', true);

INSERT INTO users (identity_id, profile_id, full_name, authorities)
VALUES (
           (SELECT identity_id FROM identities WHERE login_id = 'VRD-10163189587406'),
           'VRD-10163189587406', 'Felix Vance', ARRAY['USER']::VARCHAR[]
       );

-- 7. Grace Lin
INSERT INTO identities (login_id, password_hash, is_active)
VALUES ('VRD-10163189587407', '$2a$10$VRtgk3dEMm3NJysOyf6XDuUtmhSBpvX88w2pEx/.xfy/Qe310f7vK', true);

INSERT INTO users (identity_id, profile_id, full_name, authorities)
VALUES (
           (SELECT identity_id FROM identities WHERE login_id = 'VRD-10163189587407'),
           'VRD-10163189587407', 'Grace Lin', ARRAY['USER']::VARCHAR[]
       );

-- 8. Henry Cole
INSERT INTO identities (login_id, password_hash, is_active)
VALUES ('VRD-10163189587408', '$2a$10$VRtgk3dEMm3NJysOyf6XDuUtmhSBpvX88w2pEx/.xfy/Qe310f7vK', true);

INSERT INTO users (identity_id, profile_id, full_name, authorities)
VALUES (
           (SELECT identity_id FROM identities WHERE login_id = 'VRD-10163189587408'),
           'VRD-10163189587408', 'Henry Cole', ARRAY['USER']::VARCHAR[]
       );

-- 9. Isabella Gomez
INSERT INTO identities (login_id, password_hash, is_active)
VALUES ('VRD-10163189587409', '$2a$10$VRtgk3dEMm3NJysOyf6XDuUtmhSBpvX88w2pEx/.xfy/Qe310f7vK', true);

INSERT INTO users (identity_id, profile_id, full_name, authorities)
VALUES (
           (SELECT identity_id FROM identities WHERE login_id = 'VRD-10163189587409'),
           'VRD-10163189587409', 'Isabella Gomez', ARRAY['USER']::VARCHAR[]
       );

-- 10. Jack Fisher
INSERT INTO identities (login_id, password_hash, is_active)
VALUES ('VRD-10163189587410', '$2a$10$VRtgk3dEMm3NJysOyf6XDuUtmhSBpvX88w2pEx/.xfy/Qe310f7vK', true);

INSERT INTO users (identity_id, profile_id, full_name, authorities)
VALUES (
           (SELECT identity_id FROM identities WHERE login_id = 'VRD-10163189587410'),
           'VRD-10163189587410', 'Jack Fisher', ARRAY['USER']::VARCHAR[]
       );
