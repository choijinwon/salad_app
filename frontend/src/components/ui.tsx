import type { ReactNode } from "react";
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { colors, shadows, spacing } from "../theme";

export function Page({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.page, style]}>{children}</View>;
}

export function HeroPanel({
  eyebrow,
  title,
  body,
  children,
  tone = "dark",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  children?: ReactNode;
  tone?: "dark" | "light";
}) {
  const dark = tone === "dark";
  return (
    <View style={[styles.hero, dark ? styles.heroDark : styles.heroLight]}>
      <Text style={[styles.eyebrow, dark ? styles.eyebrowDark : styles.eyebrowLight]}>
        {eyebrow}
      </Text>
      <Text style={[styles.heroTitle, dark ? styles.heroTitleDark : styles.heroTitleLight]}>
        {title}
      </Text>
      {body ? (
        <Text style={[styles.heroBody, dark ? styles.heroBodyDark : styles.heroBodyLight]}>
          {body}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({
  action,
  subtitle,
  title,
}: {
  action?: ReactNode;
  subtitle?: string;
  title: string;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function PrimaryButton({
  children,
  tone = "green",
  style,
  ...props
}: PressableProps & {
  children: ReactNode;
  tone?: "green" | "slate";
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      style={[
        styles.button,
        tone === "green" ? styles.buttonGreen : styles.buttonSlate,
        style,
      ]}
      {...props}
    >
      <Text style={styles.buttonText}>{children}</Text>
    </Pressable>
  );
}

export function Badge({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: "green" | "blue" | "amber" | "coral" | "slate";
}) {
  return (
    <Text style={[styles.badge, badgeStyles[tone].badge]}>
      <Text style={badgeStyles[tone].text}>{children}</Text>
    </Text>
  );
}

export function InfoRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function MetricCard({
  label,
  value,
  tone = "green",
}: {
  label: string;
  value: string;
  tone?: "green" | "blue" | "amber" | "coral";
}) {
  return (
    <View style={[styles.metric, metricStyles[tone]]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const badgeStyles = {
  amber: {
    badge: { backgroundColor: colors.amberSoft },
    text: { color: colors.amber },
  },
  blue: {
    badge: { backgroundColor: colors.blueSoft },
    text: { color: colors.blue },
  },
  coral: {
    badge: { backgroundColor: colors.coralSoft },
    text: { color: colors.coral },
  },
  green: {
    badge: { backgroundColor: colors.greenSoft },
    text: { color: colors.greenDark },
  },
  slate: {
    badge: { backgroundColor: colors.slateSoft },
    text: { color: colors.slate },
  },
};

const metricStyles = {
  amber: { borderLeftColor: colors.amber },
  blue: { borderLeftColor: colors.blue },
  coral: { borderLeftColor: colors.coral },
  green: { borderLeftColor: colors.green },
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  button: {
    alignItems: "center",
    borderRadius: spacing.radius,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14,
  },
  buttonGreen: {
    backgroundColor: colors.green,
  },
  buttonSlate: {
    backgroundColor: colors.slate,
  },
  buttonText: {
    color: colors.panel,
    fontSize: 14,
    fontWeight: "900",
  },
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    padding: 16,
    ...shadows.card,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "900",
  },
  eyebrowDark: {
    color: colors.mint,
  },
  eyebrowLight: {
    color: colors.greenDark,
  },
  hero: {
    borderRadius: spacing.radius,
    padding: 18,
  },
  heroBody: {
    lineHeight: 21,
    marginTop: 8,
  },
  heroBodyDark: {
    color: "#D9E9DC",
  },
  heroBodyLight: {
    color: colors.muted,
  },
  heroDark: {
    backgroundColor: colors.slate,
  },
  heroLight: {
    backgroundColor: colors.greenSoft,
    borderColor: colors.line,
    borderWidth: 1,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 4,
  },
  heroTitleDark: {
    color: colors.panel,
  },
  heroTitleLight: {
    color: colors.foreground,
  },
  infoLabel: {
    color: colors.muted,
    fontWeight: "800",
  },
  infoRow: {
    alignItems: "center",
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  infoValue: {
    color: colors.foreground,
    flexShrink: 1,
    fontWeight: "900",
    textAlign: "right",
  },
  metric: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderLeftWidth: 4,
    borderRadius: spacing.radius,
    borderWidth: 1,
    padding: 14,
    width: "48%",
    ...shadows.card,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  metricValue: {
    color: colors.foreground,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 6,
  },
  page: {
    gap: 14,
    padding: spacing.page,
  },
  sectionSubtitle: {
    color: colors.muted,
    lineHeight: 19,
    marginTop: 3,
  },
  sectionTitle: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: "900",
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitleText: {
    flex: 1,
  },
});
