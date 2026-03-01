import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

interface WeeklyReportTemplateProps {
    domain: string;
    currentScore: number;
    previousScore: number;
    userName?: string;
}

export const WeeklyReportTemplate = ({
    domain = "example.com",
    currentScore = 85,
    previousScore = 80,
    userName = "There",
}: WeeklyReportTemplateProps) => {
    const delta = currentScore - previousScore;
    const isPositive = delta >= 0;
    const deltaText = isPositive ? `+${delta}` : `${delta}`;
    const deltaColor = isPositive ? "#10B981" : "#EF4444"; // Emerald-500 or Red-500

    return (
        <Html>
            <Head />
            <Preview>Your Weekly SEO Report for {domain}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>RankyPulse</Heading>

                    <Text style={paragraph}>Hi {userName},</Text>
                    <Text style={paragraph}>
                        Here is your weekly SEO performance update for <strong>{domain}</strong>.
                    </Text>

                    <Section style={scoreSection}>
                        <Text style={scoreLabel}>Current SEO Score</Text>
                        <Text style={scoreValue}>{currentScore}/100</Text>
                        <Text style={{ ...scoreDelta, color: deltaColor }}>
                            {deltaText} points since last week (Prev: {previousScore})
                        </Text>
                    </Section>

                    <Hr style={hr} />

                    <Text style={paragraph}>
                        To keep your traffic growing, make sure to resolve any new high-priority issues we found during this week's scan.
                    </Text>

                    <Section style={btnContainer}>
                        <Button
                            style={button}
                            href={`https://rankypulse.com/report/${domain}`}
                        >
                            View Full Audit Report
                        </Button>
                    </Section>

                    <Text style={footer}>
                        RankyPulse — Automated Technical SEO Audits<br />
                        You are receiving this because you saved {domain} to your dashboard.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default WeeklyReportTemplate;

const main = {
    backgroundColor: "#f6f9fc",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
    border: "1px solid #e6ebf1",
    borderRadius: "8px",
};

const heading = {
    fontSize: "24px",
    letterSpacing: "-0.5px",
    lineHeight: "1.3",
    fontWeight: "700",
    color: "#4F46E5", // Indigo-600
    padding: "17px 0 0",
    textAlign: "center" as const,
};

const paragraph = {
    margin: "0 0 15px",
    fontSize: "15px",
    lineHeight: "1.4",
    color: "#3c4149",
    padding: "0 48px",
};

const scoreSection = {
    padding: "24px",
    backgroundColor: "#F9FAFB",
    borderRadius: "8px",
    margin: "24px 48px",
    textAlign: "center" as const,
    border: "1px solid #E5E7EB",
};

const scoreLabel = {
    fontSize: "14px",
    color: "#6B7280",
    margin: "0 0 8px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    fontWeight: "600",
};

const scoreValue = {
    fontSize: "48px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 8px",
};

const scoreDelta = {
    fontSize: "14px",
    fontWeight: "500",
    margin: "0",
};

const btnContainer = {
    textAlign: "center" as const,
    marginTop: "32px",
};

const button = {
    backgroundColor: "#4F46E5",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "15px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    fontWeight: "600",
    padding: "12px 24px",
};

const hr = {
    borderColor: "#e6ebf1",
    margin: "20px 0",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "16px",
    padding: "0 48px",
    textAlign: "center" as const,
    marginTop: "32px",
};
