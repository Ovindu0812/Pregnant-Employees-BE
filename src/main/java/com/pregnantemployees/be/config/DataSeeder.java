package com.pregnantemployees.be.config;

import com.pregnantemployees.be.entity.AccountStatus;
import com.pregnantemployees.be.entity.AppUser;
import com.pregnantemployees.be.entity.Assessment;
import com.pregnantemployees.be.entity.Feedback;
import com.pregnantemployees.be.entity.LegalRight;
import com.pregnantemployees.be.entity.UserRole;
import com.pregnantemployees.be.repository.AppUserRepository;
import com.pregnantemployees.be.repository.AssessmentRepository;
import com.pregnantemployees.be.repository.FeedbackRepository;
import com.pregnantemployees.be.repository.LegalRightRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedDatabase(AppUserRepository userRepository,
                                   LegalRightRepository legalRightRepository,
                                   AssessmentRepository assessmentRepository,
                                   FeedbackRepository feedbackRepository) {
        return args -> {
            if (legalRightRepository.count() == 0) {
                legalRightRepository.save(new LegalRight(null, "Maternity Leave", "Leave Rights",
                        "Under Sri Lankan labor rules, female employees are entitled to maternity leave and workplace protections.",
                        "The frontend expects content that explains leave, safety, and non-discrimination protections for pregnant employees."));
                legalRightRepository.save(new LegalRight(null, "Workplace Safety", "Safety",
                        "Employers must provide a safe working environment during pregnancy.",
                        "This includes reducing exposure to harmful chemicals, limiting heavy lifting, and adjusting workstations where needed."));
                legalRightRepository.save(new LegalRight(null, "Protection against Dismissal", "Non-discrimination",
                        "It is illegal to terminate an employee solely because of pregnancy.",
                        "Any adverse employment action must be unrelated to pregnancy and supported by a legitimate reason."));
            }

            if (userRepository.count() == 0) {
                AppUser admin = new AppUser();
                admin.setName("Sunil Silva");
                admin.setEmail("admin@example.com");
                admin.setPassword("admin123");
                admin.setRole(UserRole.ADMIN);
                admin.setWorkplaceType("N/A");
                admin.setStatus(AccountStatus.ACTIVE);
                userRepository.save(admin);

                AppUser employee = new AppUser();
                employee.setName("Amali Perera");
                employee.setEmail("amali@example.com");
                employee.setPassword("password123");
                employee.setRole(UserRole.EMPLOYEE);
                employee.setPhone("071 234 5678");
                employee.setDob(LocalDate.of(1995, 5, 15));
                employee.setSector("Private");
                employee.setJobTitle("Software Engineer");
                employee.setOrganization("Tech Solutions Ltd.");
                employee.setLocation("Colombo");
                employee.setYearsEmployed("3");
                employee.setWorkingHours("8");
                employee.setWorkType("Office");
                employee.setPregnancyWeek(14);
                employee.setExpectedDeliveryDate(LocalDate.now().plusMonths(5));
                employee.setWorkplaceType("Office");
                employee.setStatus(AccountStatus.ACTIVE);
                userRepository.save(employee);
            }

            if (assessmentRepository.count() == 0) {
                Assessment low = new Assessment();
                low.setUserId(2L);
                low.setUserName("Amali Perera");
                low.setWorkplaceType("Office");
                low.setPregnancyWeek(14);
                low.setConditions("None");
                low.setWorkingHours("8-10");
                low.setStandingTime("Short");
                low.setLiftingWeight("Light");
                low.setStressLevel("Low");
                low.setRiskLevel("Low");
                assessmentRepository.save(low);

                Assessment medium = new Assessment();
                medium.setUserId(2L);
                medium.setUserName("Amali Perera");
                medium.setWorkplaceType("Office");
                medium.setPregnancyWeek(20);
                medium.setConditions("Back pain");
                medium.setWorkingHours("8-10");
                medium.setStandingTime("Long");
                medium.setLiftingWeight("Light");
                medium.setStressLevel("Medium");
                medium.setRiskLevel("Medium");
                assessmentRepository.save(medium);
            }

            if (feedbackRepository.count() == 0) {
                Feedback first = new Feedback();
                first.setUserName("Amali P.");
                first.setRating(5);
                first.setComment("Very helpful platform to know my rights.");
                feedbackRepository.save(first);

                Feedback second = new Feedback();
                second.setUserName("Nimesha F.");
                second.setRating(4);
                second.setComment("Risk assessment was easy to use.");
                feedbackRepository.save(second);
            }
        };
    }
}