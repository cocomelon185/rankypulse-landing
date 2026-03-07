import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface RankItem {
  keyword: string;
  change: number;
  position: number;
}

interface RankReportTemplateProps {
  domain: string;
  userName?: string;
  visibility: number;
  visibilityChange: number;
  winners: RankItem[];
  losers: RankItem[];
  entering_top10: string[];
  leaving_top10: string[];
}

export const RankReportTemplate = ({
  domain = "example.com",
  userName = "there",
  visibility = 0,
  visibilityChange = 0,
  winners = [],
  losers = [],
  entering_top10 = [],
  leaving_top10 = [],
}: RankReportTemplateProps) => {
  const visPositive = visibilityChange >= 0;
  const visText = visPositive
    ? `+${visibilityChange.toFixed(1)}`
    : `${visibilityChange.toFixed(1)}`;
  const visColor = visPositive ? "#10B981" : "#EF4444";

  return (
    <Html>
      <Head />
      <Preview>
        Your weekly rank report for {domain} — Visibility {visText}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>RankyPulse</Heading>

          <Text style={paragraph}>Hi {userName},</Text>
          <Text style={paragraph}>
            Here is your weekly ranking summary for <strong>{domain}</strong>.
          </Text>

          {/* Visibility Score */}
          <Section style={scoreSection}>
            <Text style={scoreLabel}>Visibility Score</Text>
            <Text style={scoreValue}>{visibility.toFixed(1)}</Text>
            <Text style={{ ...scoreDelta, color: visColor }}>
              {visText} vs last week
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Winners */}
          {winners.length > 0 && (
            <>
              <Text style={sectionTitle}>🏆 Top Winners</Text>
              {winners.map((w) => (
                <Row key={w.keyword} style={rankRow}>
                  <Column style={rankKeyword}>{w.keyword}</Column>
                  <Column style={rankPos}>#{w.position}</Column>
                  <Column style={{ ...rankChange, color: "#10B981" }}>
                    +{w.change}
                  </Column>
                </Row>
              ))}
              <Hr style={hr} />
            </>
          )}

          {/* Losers */}
          {losers.length > 0 && (
            <>
              <Text style={sectionTitle}>📉 Top Losers</Text>
              {losers.map((l) => (
                <Row key={l.keyword} style={rankRow}>
                  <Column style={rankKeyword}>{l.keyword}</Column>
                  <Column style={rankPos}>#{l.position}</Column>
                  <Column style={{ ...rankChange, color: "#EF4444" }}>
                    {l.change}
                  </Column>
                </Row>
              ))}
              <Hr style={hr} />
            </>
          )}

          {/* Entering Top 10 */}
          {entering_top10.length > 0 && (
            <>
              <Text style={sectionTitle}>✅ Keywords Entering Top 10</Text>
              {entering_top10.map((kw) => (
                <Text key={kw} style={listItem}>
                  • {kw}
                </Text>
              ))}
              <Hr style={hr} />
            </>
          )}

          {/* Leaving Top 10 */}
          {leaving_top10.length > 0 && (
            <>
              <Text style={sectionTitle}>⚠️ Keywords Dropping Out of Top 10</Text>
              {leaving_top10.map((kw) => (
                <Text key={kw} style={listItem}>
                  • {kw}
                </Text>
              ))}
              <Hr style={hr} />
            </>
          )}

          <Section style={btnContainer}>
            <Button
              style={button}
              href={`https://rankypulse.com/app/position-tracking`}
            >
              View Full Rank Report
            </Button>
          </Section>

          <Text style={footer}>
            RankyPulse — Daily Rank Intelligence
            <br />
            You are receiving this because you track keywords for {domain}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default RankReportTemplate;

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
  color: "#4F46E5",
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

const sectionTitle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#111827",
  margin: "0 0 12px",
  padding: "0 48px",
};

const rankRow = {
  padding: "0 48px",
  marginBottom: "8px",
};

const rankKeyword = {
  fontSize: "13px",
  color: "#374151",
  width: "60%",
};

const rankPos = {
  fontSize: "13px",
  color: "#6B7280",
  width: "20%",
  textAlign: "center" as const,
};

const rankChange = {
  fontSize: "13px",
  fontWeight: "700",
  width: "20%",
  textAlign: "right" as const,
};

const listItem = {
  fontSize: "13px",
  color: "#374151",
  margin: "0 0 4px",
  padding: "0 48px",
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
