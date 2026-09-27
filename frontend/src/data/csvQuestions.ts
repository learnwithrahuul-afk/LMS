export interface AssessmentQuestion {
    id: number;
    question: string;
    options: string[];
}

export const defaultCsvQuestions: AssessmentQuestion[] = [
    {
        id: 1,
        question: "What is the primary objective of Computerized System Validation (CSV) in the pharmaceutical and life sciences industry?",
        options: [
            "To eliminate all paper documentation without regulatory oversight",
            "To ensure computerized systems consistently perform according to intended use while ensuring patient safety, product quality, and data integrity",
            "To minimize IT infrastructure and server hosting costs",
            "To accelerate software deployment speed regardless of compliance risk"
        ]
    },
    {
        id: 2,
        question: "According to GAMP 5, what is the core philosophy recommended for validating GxP systems?",
        options: [
            "A risk-based life cycle approach focusing effort on critical aspects that impact patient safety and product quality",
            "Exhaustive 100% testing of every line of vendor source code",
            "Testing solely at the user interface level with no documentation",
            "Relying entirely on vendor certifications without any internal testing"
        ]
    },
    {
        id: 3,
        question: "In GAMP 5 software categorization, which category does a configured commercial software product (such as LIMS or ERP) belong to?",
        options: [
            "Category 1 — Infrastructure Software",
            "Category 3 — Non-Configured Products",
            "Category 4 — Configured Products",
            "Category 5 — Custom / Bespoke Applications"
        ]
    },
    {
        id: 4,
        question: "Under FDA 21 CFR Part 11, what is a mandatory requirement for electronic signatures?",
        options: [
            "They may be shared among team members within the same department",
            "They must expire and be re-purchased on a monthly basis",
            "They must be unique to one individual and never reused by or reassigned to anyone else",
            "They must always be accompanied by a biometric iris scan"
        ]
    },
    {
        id: 5,
        question: "What is the primary regulatory purpose of a computerized Audit Trail under 21 CFR Part 11 and GxP?",
        options: [
            "To track network bandwidth consumption and system uptime",
            "To automatically compress and archive database files older than 30 days",
            "To provide a secure, computer-generated, time-stamped record detailing who, what, when, and why data was created, modified, or deleted",
            "To monitor employee work hours and log out inactive sessions"
        ]
    },
    {
        id: 6,
        question: "What is the purpose of a Validation Master Plan (VMP)?",
        options: [
            "It defines the organization's overarching validation policy, scope, strategy, schedule, and responsibilities for all computerized systems",
            "It serves as the end-user instruction manual for daily system operation",
            "It contains the commercial billing agreements and software licensing contracts",
            "It is a disaster recovery backup script stored offsite"
        ]
    },
    {
        id: 7,
        question: "The User Requirement Specification (URS) is essential in the validation lifecycle because:",
        options: [
            "It specifies the low-level database indexing queries and memory pointers",
            "It defines what the business users need the system to do and forms the direct acceptance criteria for Performance Qualification (PQ)",
            "It replaces the need for any formal test protocols",
            "It is written exclusively by hardware suppliers after system go-live"
        ]
    },
    {
        id: 8,
        question: "In the V-Model validation framework, Functional Specifications (FS) map directly to which testing phase?",
        options: [
            "Installation Qualification (IQ)",
            "Vendor Site Audit",
            "Operational Qualification (OQ)",
            "Decommissioning / Retirement Verification"
        ]
    },
    {
        id: 9,
        question: "What does Installation Qualification (IQ) specifically verify and document?",
        options: [
            "That hardware, software components, network infrastructure, and environment are properly installed according to approved design specifications",
            "That the software algorithm runs without memory leaks under peak stress loads",
            "That end-users have completed business workflow training",
            "That regulatory audits are scheduled for the current fiscal quarter"
        ]
    },
    {
        id: 10,
        question: "Operational Qualification (OQ) is designed to test:",
        options: [
            "Only the physical power supply and server rack mounting",
            "That system functions, operating parameters, security access controls, and alarm limits operate as intended against the Functional Specifications",
            "The final commercial drug manufacturing batch yield",
            "The marketing performance of the corporate website"
        ]
    },
    {
        id: 11,
        question: "Performance Qualification (PQ) provides documented evidence that:",
        options: [
            "The system performs consistently, effectively, and reproducibly under real-world operating conditions according to approved user requirements (URS)",
            "The software compiler has no syntax warnings during build time",
            "The vendor has passed financial solvency checks",
            "The physical computer monitors meet ergonomic standards"
        ]
    },
    {
        id: 12,
        question: "In risk assessment methodologies (such as FMEA) applied to CSV, how is the Risk Priority / Risk Score determined?",
        options: [
            "Cost of software divided by number of active licenses",
            "Lines of code multiplied by number of developers",
            "Severity of impact on product quality and patient safety multiplied by the Probability of occurrence (and Detectability)",
            "Number of test cases executed per hour"
        ]
    },
    {
        id: 13,
        question: "Once a system is in operational use, what mechanism is mandatory to ensure it remains in a continuous validated state when modifications occur?",
        options: [
            "Ad-hoc hotfixes applied directly to production servers without notification",
            "A formalized Change Control procedure to assess impact, approve, test, and document all changes before deployment",
            "Reinstalling the original software version at midnight every weekend",
            "Deleting user activity logs prior to every update"
        ]
    },
    {
        id: 14,
        question: "Under the ALCOA+ data integrity framework widely used in CSV, what does the 'C' stand for?",
        options: [
            "Calculated",
            "Compressed",
            "Contemporaneous (recorded at the time the activity was executed)",
            "Confidential"
        ]
    },
    {
        id: 15,
        question: "How does the FDA's modern Computer Software Assurance (CSA) approach differ from traditional CSV?",
        options: [
            "CSA emphasizes critical thinking, risk-based testing, and unscripted testing on direct patient/product impact rather than burdensome excessive documentation",
            "CSA completely abolishes all forms of software testing in life sciences",
            "CSA requires double the amount of paper documentation compared to CSV",
            "CSA applies exclusively to non-computerized manual paper records"
        ]
    }
];
