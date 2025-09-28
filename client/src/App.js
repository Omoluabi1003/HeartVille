import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,

  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { io } from 'socket.io-client';

const API_URL = Platform.select({
  ios: 'http://localhost:4000',
  android: 'http://10.0.2.2:4000',
  default: 'http://localhost:4000',
});

const CURRENT_USER_ID = 'user-1';

const tabs = [
  { id: 'discover', label: 'Discover' },
  { id: 'matches', label: 'Matches' },
  { id: 'messages', label: 'Messages' },
  { id: 'insights', label: 'Insights' },
];

const formatTimeAgo = (value) => {
  const timestamp = typeof value === 'string' ? new Date(value) : value;
  const diff = Date.now() - timestamp.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
};

const TabButton = ({ isActive, label, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.tabButton, isActive && styles.tabButtonActive]}>
    <Text style={[styles.tabButtonLabel, isActive && styles.tabButtonLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

const InterestPill = ({ label }) => (
  <View style={styles.pill}>
    <Text style={styles.pillText}>{label}</Text>
  </View>
);

const PromptCard = ({ answer, question }) => (
  <View style={styles.promptCard}>
    <Text style={styles.promptQuestion}>{question}</Text>
    <Text style={styles.promptAnswer}>{answer}</Text>
  </View>
);

const SectionTitle = ({ accent, children, subtitle }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>
      {children}
      {accent ? <Text style={styles.sectionTitleAccent}> {accent}</Text> : null}
    </Text>
    {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
  </View>
);

const MatchCard = ({ match }) => (
  <View style={styles.matchCard}>
    <View style={styles.matchHeader}>
      <View>
        <Text style={styles.matchName}>{match.profile?.name}</Text>
        <Text style={styles.matchMeta}>
          {match.profile?.location ?? 'Somewhere nearby'} • {match.compatibility}% vibe match
        </Text>
      </View>
      <View style={styles.matchBadge}>
        <Text style={styles.matchBadgeText}>{match.compatibility}%</Text>
      </View>
    </View>
    <Text style={styles.matchTime}>Matched {formatTimeAgo(match.createdAt)}</Text>
    <View style={styles.matchPrompts}>
      {(match.conversationStarters ?? []).map((starter, index) => (
        <View key={starter} style={styles.starterPill}>
          <Text style={styles.starterPillIndex}>{index + 1}</Text>
          <Text style={styles.starterPillText}>{starter}</Text>
        </View>
      ))}
    </View>
  </View>
);

const MessagePreview = ({ message }) => (
  <View style={styles.messageCard}>
    <View style={styles.messageCardHeader}>
      <Text style={styles.messageName}>{message.name}</Text>
      <Text style={styles.messageTime}>{formatTimeAgo(message.timestamp)}</Text>
    </View>
    <Text style={styles.messagePreview}>{message.preview}</Text>
  </View>
);

const InsightStat = ({ label, value, tone = 'default' }) => (
  <View style={[styles.insightStat, styles[`insightStat_${tone}`]]}>
    <Text style={styles.insightValue}>{value}</Text>
    <Text style={styles.insightLabel}>{label}</Text>
  </View>
);

const DiscoverCard = ({ onLike, onPass, onSuperLike, profile }) => {
  if (!profile) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>You’re all caught up! ✨</Text>
        <Text style={styles.emptySubtitle}>
          Check back soon — we’re curating more aligned matches for you.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.profileCard}>
      <Image source={{ uri: profile.image }} style={styles.profileImage} />
      <View style={styles.profileOverlay} />
      <View style={styles.profileContent}>
        <View style={styles.profileHeaderRow}>
          <View>
            <Text style={styles.profileName}>
              {profile.name}, {profile.age}
            </Text>
            <Text style={styles.profileLocation}>{profile.location}</Text>
          </View>
          <View style={styles.compatibilityContainer}>
            <Text style={styles.compatibilityValue}>{profile.compatibility}%</Text>
            <Text style={styles.compatibilityLabel}>Vibe match</Text>
          </View>
        </View>
        <Text style={styles.profileTagline}>{profile.tagline}</Text>
        <Text style={styles.profileBio}>{profile.bio}</Text>
        <SectionTitle accent="energy" subtitle={profile.compatibilityWhy}>
          Why you click
        </SectionTitle>
        <View style={styles.interestsRow}>
          {(profile.interests ?? []).map((interest) => (
            <InterestPill key={interest} label={interest} />
          ))}
        </View>
        <SectionTitle accent="vibes">Conversation sparks</SectionTitle>
        <View style={styles.promptRow}>
          {(profile.prompts ?? []).map((prompt) => (
            <PromptCard key={prompt.question} {...prompt} />
          ))}
        </View>
      </View>
      <View style={styles.profileActions}>
        <TouchableOpacity onPress={onPass} style={[styles.actionButton, styles.passButton]}>
          <Text style={styles.actionButtonText}>Pass</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSuperLike} style={[styles.actionButton, styles.superLikeButton]}>
          <Text style={styles.actionButtonText}>Spark</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onLike} style={[styles.actionButton, styles.likeButton]}>
          <Text style={styles.actionButtonText}>Connect</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DiscoverView = ({ onLike, onPass, onSuperLike, profile }) => (
  <ScrollView showsVerticalScrollIndicator={false} style={styles.discoverScroll}>
    <DiscoverCard profile={profile} onLike={onLike} onPass={onPass} onSuperLike={onSuperLike} />
    <View style={styles.footerSpace} />
  </ScrollView>
);

const MatchesView = ({ matches }) => (
  <ScrollView showsVerticalScrollIndicator={false} style={styles.matchesScroll}>
    <SectionTitle accent="aligned" subtitle="Swipe intentionally, spark meaningfully">
      Recent connections
    </SectionTitle>
    {matches.length === 0 ? (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No matches yet — but they’re close.</Text>
        <Text style={styles.emptySubtitle}>
          Keep sharing your energy. Heartville is introducing you to people who align with your values.
        </Text>
      </View>
    ) : (
      matches.map((match) => <MatchCard key={match.id} match={match} />)
    )}
    <View style={styles.footerSpace} />
  </ScrollView>
);

const MessagesView = ({ messages }) => (
  <ScrollView showsVerticalScrollIndicator={false} style={styles.matchesScroll}>
    <SectionTitle accent="flow" subtitle="Your conversations with momentum">
      Messages
    </SectionTitle>
    {messages.length === 0 ? (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No conversations just yet.</Text>
        <Text style={styles.emptySubtitle}>
          When sparks fly, we’ll surface thoughtful conversation starters right here.
        </Text>
      </View>
    ) : (
      messages.map((message) => <MessagePreview key={message.matchId} message={message} />)
    )}
    <View style={styles.footerSpace} />
  </ScrollView>
);

const InsightsView = ({ insights }) => (
  <ScrollView showsVerticalScrollIndicator={false} style={styles.matchesScroll}>
    <SectionTitle accent="insights" subtitle="Signals from the week">
      Connection insights
    </SectionTitle>
    {!insights ? (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No insight data yet.</Text>
        <Text style={styles.emptySubtitle}>
          Once you start matching, we’ll surface the patterns that matter.
        </Text>
      </View>
    ) : (
      <>
        <View style={styles.insightGrid}>
          <InsightStat label="Likes this week" value={insights.totalLikesThisWeek} tone="highlight" />
          <InsightStat label="Reply rate" value={`${insights.responseRate}%`} tone="balance" />
          <InsightStat label="Connection strength" value={`${insights.connectionStrength}%`} tone="glow" />
        </View>
        <SectionTitle accent="magnetic">Magnetic topics</SectionTitle>
        <View style={styles.interestsRow}>
          {(insights.topInterests ?? []).map((interest) => (
            <View key={interest.label} style={styles.trendPill}>
              <Text style={styles.trendCount}>{interest.count}</Text>
              <Text style={styles.trendLabel}>{interest.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.insightHighlight}>
          <Text style={styles.insightHighlightTitle}>This week’s spark</Text>
          <Text style={styles.insightHighlightText}>{insights.highlight}</Text>
        </View>
      </>
    )}
    <View style={styles.footerSpace} />
  </ScrollView>
);

const StatusToast = ({ message, tone }) => (
  <View style={[styles.toast, tone === 'error' ? styles.toastError : styles.toastSuccess]}>
    <Text style={styles.toastText}>{message}</Text>
  </View>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('discover');
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [insights, setInsights] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const [profilesRes, matchesRes, messagesRes, insightsRes] = await Promise.all([
          fetch(`${API_URL}/api/profiles`),
          fetch(`${API_URL}/api/matches?userId=${CURRENT_USER_ID}`),
          fetch(`${API_URL}/api/messages?userId=${CURRENT_USER_ID}`),
          fetch(`${API_URL}/api/insights`),
        ]);

        const [{ profiles: profileData }, { matches: matchData }, { messages: messageData }, { insights: insightData }] = await Promise.all([
          profilesRes.json(),
          matchesRes.json(),
          messagesRes.json(),
          insightsRes.json(),
        ]);

        if (!isMounted) {
          return;
        }

        const curatedProfiles = profileData.filter((profile) => profile.id !== CURRENT_USER_ID);
        setProfiles(curatedProfiles);
        setCurrentUser(profileData.find((profile) => profile.id === CURRENT_USER_ID) ?? null);
        setMatches(matchData);
        setMessages(messageData);
        setInsights(insightData);
        setCurrentIndex(0);
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setToast({ tone: 'error', message: 'Unable to load Heartville right now. Try again soon.' });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    socketRef.current = io(API_URL, {
      transports: ['websocket'],
    });

    socketRef.current.on('new-match', (payload) => {
      setMatches((previous) => {
        const exists = previous.some((match) => match.id === payload.id);
        return exists
          ? previous
          : [
              {
                ...payload,
              },
              ...previous,
            ];
      });
      setToast({ tone: 'success', message: `New connection with ${payload.profile?.name ?? 'someone lovely'}!` });
    });

    socketRef.current.on('welcome', () => {
      setToast({ tone: 'success', message: 'Live connection secured — we’ll alert you to fresh matches.' });
    });

    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timeout);
  }, [toast]);

  const currentProfile = profiles[currentIndex] ?? null;

  const hasProfiles = profiles.length > 0;

  const sortedMatches = useMemo(
    () =>
      [...matches].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [matches]
  );

  const handleAdvance = () => {
    setCurrentIndex((index) => {
      if (!hasProfiles) {
        return 0;
      }
      return index + 1 >= profiles.length ? profiles.length : index + 1;
    });
  };

  const handlePass = () => {
    handleAdvance();
    setToast({ tone: 'success', message: 'Noted. We’ll keep refining your matches.' });
  };

  const handleLike = async ({ superLike = false } = {}) => {
    if (!currentProfile) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: CURRENT_USER_ID,
          targetId: currentProfile.id,
          superLike,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to create match');
      }

      setMatches((previous) => {
        const exists = previous.some((match) => match.id === data.match.id);
        if (exists) {
          return previous.map((match) => (match.id === data.match.id ? data.match : match));
        }
        return [data.match, ...previous];
      });

      setToast({
        tone: 'success',
        message: superLike
          ? `Spark sent to ${currentProfile.name}!`
          : `Connection sent to ${currentProfile.name}. We’ll let you know if it’s mutual!`,
      });
    } catch (error) {
      console.error(error);
      setToast({ tone: 'error', message: 'Something glitched. Try sending that vibe again.' });
    } finally {
      handleAdvance();
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingState}>
          <ActivityIndicator color="#FF5F8F" size="large" />
          <Text style={styles.loadingText}>Opening Heartville…</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'matches':
        return <MatchesView matches={sortedMatches} />;
      case 'messages':
        return <MessagesView messages={messages} />;
      case 'insights':
        return <InsightsView insights={insights} />;
      default:
        return (
          <DiscoverView
            profile={currentProfile}
            onPass={handlePass}
            onLike={() => handleLike()}
            onSuperLike={() => handleLike({ superLike: true })}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.brandMark}>Heartville</Text>
          <Text style={styles.headerSubtitle}>
            {currentUser ? `Hi ${currentUser.name.split(' ')[0]}, ready to connect intentionally?` : 'Dating with aligned energy.'}
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>Beta</Text>
        </View>
      </View>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TabButton key={tab.id} isActive={activeTab === tab.id} label={tab.label} onPress={() => setActiveTab(tab.id)} />)
        )}
      </View>
      {toast ? <StatusToast message={toast.message} tone={toast.tone} /> : null}
      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D0B1A',
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandMark: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    fontSize: 15,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 1.1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 12,
    borderRadius: 999,
  },
  tabButtonActive: {
    backgroundColor: '#FF5F8F',
  },
  tabButtonLabel: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  tabButtonLabelActive: {
    color: '#0D0B1A',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  discoverScroll: {
    paddingHorizontal: 16,
  },
  matchesScroll: {
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: '#16152A',
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  profileImage: {
    width: '100%',
    height: 320,
  },
  profileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 11, 26, 0.15)',
  },
  profileContent: {
    padding: 24,
    gap: 16,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  profileLocation: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  compatibilityContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  compatibilityValue: {
    color: '#FF86B0',
    fontWeight: '700',
    fontSize: 18,
  },
  compatibilityLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  profileTagline: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  profileBio: {
    color: 'rgba(255,255,255,0.74)',
    lineHeight: 20,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitleAccent: {
    color: '#FF86B0',
  },
  sectionSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 18,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  pillText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  promptRow: {
    gap: 12,
  },
  promptCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    borderRadius: 18,
  },
  promptQuestion: {
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    letterSpacing: 1,
  },
  promptAnswer: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 6,
    lineHeight: 22,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
    backgroundColor: 'rgba(8,8,20,0.6)',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  passButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  superLikeButton: {
    backgroundColor: 'rgba(114,137,218,0.45)',
  },
  likeButton: {
    backgroundColor: '#FF5F8F',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerSpace: {
    height: 80,
  },
  matchCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  matchMeta: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    fontSize: 13,
  },
  matchBadge: {
    backgroundColor: 'rgba(255,95,143,0.18)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  matchBadgeText: {
    color: '#FF5F8F',
    fontWeight: '700',
  },
  matchTime: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  matchPrompts: {
    gap: 10,
  },
  starterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.07)',
    padding: 14,
    borderRadius: 18,
  },
  starterPillIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,95,143,0.35)',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '700',
  },
  starterPillText: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  messageCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 18,
    borderRadius: 22,
    marginBottom: 16,
    gap: 6,
  },
  messageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  messageName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  messageTime: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
  },
  messagePreview: {
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
    fontSize: 15,
  },
  insightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  insightStat: {
    flexBasis: '48%',
    padding: 18,
    borderRadius: 20,
    gap: 6,
  },
  insightStat_highlight: {
    backgroundColor: 'rgba(255,95,143,0.18)',
  },
  insightStat_balance: {
    backgroundColor: 'rgba(114,137,218,0.15)',
  },
  insightStat_glow: {
    backgroundColor: 'rgba(94,234,212,0.18)',
  },
  insightValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  insightLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  trendPill: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  trendCount: {
    backgroundColor: 'rgba(255,95,143,0.25)',
    color: '#FFFFFF',
    fontWeight: '700',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  trendLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    flexShrink: 1,
  },
  insightHighlight: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    borderRadius: 22,
    marginTop: 12,
    gap: 6,
  },
  insightHighlightTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  insightHighlightText: {
    color: '#FFFFFF',
    lineHeight: 20,
    fontSize: 15,
  },
  emptyState: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 28,
    marginTop: 20,
    gap: 8,
    alignItems: 'flex-start',
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 20,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  toast: {
    marginHorizontal: 24,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  toastSuccess: {
    backgroundColor: 'rgba(94, 234, 212, 0.2)',
  },
  toastError: {
    backgroundColor: 'rgba(255, 95, 143, 0.18)',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profileHeader: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
});
