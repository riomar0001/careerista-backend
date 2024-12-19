CREATE schema SaksiNiJava_db;

USE SaksiNiJava_db;

CREATE TABLE company (
    company_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    company_name VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    done_onboarding BOOLEAN,
    created_at DATETIME,
    updated_at DATETIME
);

CREATE TABLE company_address (
    company_address_id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36),
    address VARCHAR(150),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE
);

CREATE TABLE company_contact (
    company_contact_id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36),
    contact_no VARCHAR(50),
    email VARCHAR(50),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE
);

CREATE TABLE company_logo (
    company_logo_id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36),
    logo VARCHAR(256),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE
);

CREATE TABLE industry (
    industry_id VARCHAR(36) PRIMARY KEY,
    industry_name VARCHAR(100) NOT NULL,
    created_at DATETIME,
    updated_at DATETIME
);

CREATE TABLE company_industry (
    company_industry_id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36),
    industry_id VARCHAR(36),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    FOREIGN KEY (industry_id) REFERENCES industry(industry_id) ON DELETE CASCADE
);

CREATE TABLE job_posting (
    job_posting_id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36),
    position VARCHAR(30),
    job_description VARCHAR(500),
    job_address VARCHAR(255),
    job_category VARCHAR(255),
    salary_range VARCHAR(30),
    work_schedule VARCHAR(10),
    is_closed BOOLEAN,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE
);


CREATE TABLE job_posting_candidates (
    candidates_id VARCHAR(36) PRIMARY KEY,
    job_posting_id VARCHAR(36),
    applicant_id VARCHAR(36),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (job_posting_id) REFERENCES job_posting(job_posting_id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES applicant(applicant_id) ON DELETE CASCADE
);

CREATE TABLE job_posting_info (
    job_posting_info_id VARCHAR(36) PRIMARY KEY,
    job_posting_id VARCHAR(36),
    job_description VARCHAR(500),
    req_years_of_exp INT(2),
    accepts_fresh_grads BOOLEAN,
    can_start_on DATE,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (job_posting_id) REFERENCES job_posting(job_posting_id) ON DELETE CASCADE
);

CREATE TABLE job_posting_industry (
    job_posting_industry_id VARCHAR(36) PRIMARY KEY,
    job_posting_id VARCHAR(36),
    industry_id VARCHAR(36),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (job_posting_id) REFERENCES job_posting(job_posting_id) ON DELETE CASCADE,
    FOREIGN KEY (industry_id) REFERENCES industry(industry_id) ON DELETE CASCADE
);



CREATE TABLE applicant (
    applicant_id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(20) NOT NULL,
    password VARCHAR(20) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    date_of_birth DATE,
    email VARCHAR(50),
    done_onboarding BOOLEAN,
    created_at DATETIME,
    updated_at DATETIME
);

CREATE TABLE applicant_contact (
    applicant_contact_id VARCHAR(36) PRIMARY KEY,
    applicant_id VARCHAR(36),
    contact_no VARCHAR(50),
    email VARCHAR(50),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (applicant_id) REFERENCES applicant(applicant_id) ON DELETE CASCADE
);

CREATE TABLE applicant_cv (
    applicant_cv_id VARCHAR(36) PRIMARY KEY,
    applicant_id VARCHAR(36),
    cv_file VARCHAR(256),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (applicant_id) REFERENCES applicant(applicant_id) ON DELETE CASCADE
);

CREATE TABLE experience (
    experience_id VARCHAR(36) PRIMARY KEY,
    applicant_id VARCHAR(36),
    company VARCHAR(80),
    address VARCHAR(150),
    position VARCHAR(40),
    years_of_stay INT(2),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (applicant_id) REFERENCES applicant(applicant_id) ON DELETE CASCADE
);

CREATE TABLE admin_logins (
    admin_id VARCHAR(36) PRIMARY KEY,
    admin_username VARCHAR(20) NOT NULL,
    admin_password VARCHAR(20) NOT NULL,
    created_at DATETIME,
    updated_at DATETIME
);

-- Insert a New Company
INSERT INTO
    company (
        company_id,
        username,
        password,
        company_name,
        is_verified,
        description,
        created_at,
        updated_at
    )
VALUES
    (
        UUID(),
        'tech_user',
        'securePass123',
        'Tech Innovators',
        TRUE,
        'A company focusing on innovative solutions.',
        NOW(),
        NOW()
    );

-- Retrieve All Job Postings by a Specific Company
SELECT
    jp.job_posting_id,
    jp.position,
    jp.post_date,
    jp.is_closed
FROM
    job_posting jp
    INNER JOIN company c ON jp.company_id = c.company_id
WHERE
    c.company_name = 'Tech Innovators';

-- Update Applicant Contact Information
UPDATE
    applicant_contact
SET
    contact_no = '09123456789',
    email = 'updated_email@example.com',
    updated_at = NOW()
WHERE
    applicant_id = 'applicant-uuid-here';

-- Delete a Company and Cascade
DELETE FROM
    company
WHERE
    company_id = 'company-uuid-here';

-- Fetch Applicants for a Specific Job Posting
SELECT
    a.applicant_id,
    a.first_name,
    a.last_name,
    a.email
FROM
    job_posting_candidates jpc
    INNER JOIN applicant a ON jpc.applicant_id = a.applicant_id
WHERE
    jpc.job_posting_id = 'job-posting-uuid-here';

-- Add a New Industry
INSERT INTO
    industry (
        industry_id,
        industry_name,
        created_at,
        updated_at
    )
VALUES
    (UUID(), 'Artificial Intelligence', NOW(), NOW());

-- Assign an Industry to a Company
INSERT INTO
    company_industry (
        company_industry_id,
        company_id,
        industry_id,
        created_at,
        updated_at
    )
VALUES
    (
        UUID(),
        'company-uuid-here',
        'industry-uuid-here',
        NOW(),
        NOW()
    );

-- Retrieve All Applicants with Their CV Details
SELECT
    a.first_name,
    a.last_name,
    ac.cv_file,
    ac.created_at
FROM
    applicant a
    INNER JOIN applicant_cv ac ON a.applicant_id = ac.applicant_id;

-- List Job Postings with Specific Industry
SELECT
    jp.job_posting_id,
    jp.position,
    jp.post_date
FROM
    job_posting jp
    INNER JOIN job_posting_industry jpi ON jp.job_posting_id = jpi.job_posting_id
    INNER JOIN industry i ON jpi.industry_id = i.industry_id
WHERE
    i.industry_name = 'Information Technology';

-- Verify an Admin Login
SELECT
    *
FROM
    admin_logins
WHERE
    admin_username = 'admin_user'
    AND admin_password = 'adminPass123';

-- Fetch Job Postings Accepting Fresh Graduates
SELECT
    jp.position,
    jpi.job_description,
    jpi.can_start_on
FROM
    job_posting jp
    INNER JOIN job_posting_info jpi ON jp.job_posting_id = jpi.job_posting_id
WHERE
    jpi.accepts_fresh_grads = TRUE
    AND jpi.can_start_on = '2024-12-15';

-- Count Number of Applications per Job Posting
SELECT
    jp.position,
    COUNT(jpc.applicant_id) AS total_applicants
FROM
    job_posting jp
    LEFT JOIN job_posting_candidates jpc ON jp.job_posting_id = jpc.job_posting_id
GROUP BY
    jp.position;

-- Retrieve Company Details and Contact Information
SELECT
    c.company_name,
    c.description,
    cc.contact_no,
    cc.email
FROM
    company c
    INNER JOIN company_contact cc ON c.company_id = cc.company_id;

-- Fetch Applicants with Their Experience
SELECT
    a.first_name,
    a.last_name,
    e.company,
    e.position,
    e.years_of_stay
FROM
    applicant a
    INNER JOIN experience e ON a.applicant_id = e.applicant_id;

-- Mark Job Posting as Closed
UPDATE
    job_posting
SET
    is_closed = TRUE,
    updated_at = NOW()
WHERE
    job_posting_id = 'job-posting-uuid-here';