import React from 'react';

const About = () => {
    return (
        <div className="about-page">
            <section className="about-hero">
                <h1>About Matel Auto Finance</h1>

                <p>
                    Matel Auto Finance is an auto finance management platform designed
                    to help manage vehicle loans, EMI payments, customer finance records,
                    and repayment schedules efficiently.
                </p>
            </section>

            <section className="about-content">
                <h2>Our Platform</h2>

                <p>
                    Our platform provides a simple and organized way to manage auto loan
                    information and keep track of important payment details.
                </p>

                <h2>What We Manage</h2>

                <ul>
                    <li>Vehicle loan management</li>
                    <li>Monthly EMI tracking</li>
                    <li>Customer finance records</li>
                    <li>Payment tracking</li>
                    <li>Loan repayment schedules</li>
                </ul>

                <h2>Our Goal</h2>

                <p>
                    Our goal is to make auto finance management more organized,
                    efficient, and secure.
                </p>
            </section>
        </div>
    );
};

export default About;