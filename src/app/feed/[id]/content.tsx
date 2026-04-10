/* eslint-disable max-lines-per-function */
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Pressable, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useCourses } from '@/features/feed/api';

export default function CourseContentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { data } = useCourses();

  const course = data?.find(c => c.id === Number(id));

  const webViewRef = React.useRef<WebView>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  const injectedJS = React.useMemo(() => {
    if (!course)
      return '';
    return `
      (function() {
        window.courseData = ${JSON.stringify({
          id: course.id,
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          price: course.price,
          rating: course.rating,
          category: course.category,
          brand: course.brand,
          thumbnail: course.thumbnail,
          images: course.images,
        })};
        window.appTheme = '${colorScheme}';
        window.dispatchEvent(new Event('courseLoaded'));
      })();
      true;
    `;
  }, [course, colorScheme]);

  const htmlContent = React.useMemo(() => {
    const isDark = colorScheme === 'dark';
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
  <title>Course Content</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: ${isDark ? '#0a0a0a' : '#f9fafb'};
      --card: ${isDark ? '#1a1a1a' : '#ffffff'};
      --card2: ${isDark ? '#242424' : '#f3f4f6'};
      --text: ${isDark ? '#f9fafb' : '#111827'};
      --subtext: ${isDark ? '#9ca3af' : '#6b7280'};
      --muted: ${isDark ? '#6b7280' : '#9ca3af'};
      --accent: #6366f1;
      --accent-bg: ${isDark ? '#1e1b4b' : '#eef2ff'};
      --accent-text: ${isDark ? '#818cf8' : '#6366f1'};
      --emerald: ${isDark ? '#34d399' : '#059669'};
      --emerald-bg: ${isDark ? '#022c22' : '#d1fae5'};
      --border: ${isDark ? '#2a2a2a' : '#e5e7eb'};
      --star-on: #f59e0b;
      --star-off: ${isDark ? '#374151' : '#d1d5db'};
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 0;
      min-height: 100vh;
    }

    /* Hero */
    .hero {
      position: relative;
      width: 100%;
      height: 220px;
      overflow: hidden;
      background: #1a1a2e;
    }
    .hero img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
    }
    .hero-scrim {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6));
    }
    .hero-badge {
      position: absolute;
      bottom: 12px; left: 12px;
      background: rgba(99,102,241,0.92);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 4px 12px;
      border-radius: 999px;
    }

    .content { padding: 20px 16px; display: flex; flex-direction: column; gap: 16px; }

    .title {
      font-size: 22px;
      font-weight: 800;
      line-height: 1.3;
      letter-spacing: -0.3px;
      color: var(--text);
    }

    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }
    .chip-indigo { background: var(--accent-bg); color: var(--accent-text); }
    .chip-emerald { background: var(--emerald-bg); color: var(--emerald); }

    .instructor-card {
      display: flex; align-items: center; gap: 12px;
      background: var(--card);
      border-radius: 16px;
      padding: 12px 14px;
      border: 1px solid var(--border);
    }
    .avatar {
      width: 40px; height: 40px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 14px; color: #fff;
      flex-shrink: 0;
    }
    .instructor-label { font-size: 11px; color: var(--muted); margin-bottom: 2px; }
    .instructor-name { font-size: 14px; font-weight: 700; color: var(--text); }

    .stars { display: flex; align-items: center; gap: 3px; }
    .star { font-size: 15px; }
    .rating-val { margin-left: 6px; font-size: 14px; font-weight: 700; color: var(--subtext); }

    .price-block {
      display: flex; align-items: center; gap: 8px;
      background: var(--accent-bg);
      border-radius: 16px;
      padding: 14px;
    }
    .price-icon { font-size: 18px; }
    .price-val { font-size: 24px; font-weight: 900; color: var(--accent-text); }
    .price-label { font-size: 12px; color: var(--muted); margin-top: 2px; }

    .divider { height: 1px; background: var(--border); }

    .section-label {
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: var(--muted);
      margin-bottom: 4px;
    }

    .description {
      font-size: 14px;
      line-height: 1.7;
      color: var(--subtext);
    }

    .gallery-scroll {
      display: flex; gap: 10px;
      overflow-x: auto;
      padding-bottom: 4px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .gallery-scroll::-webkit-scrollbar { display: none; }
    .gallery-thumb {
      flex-shrink: 0;
      width: 90px; height: 68px;
      border-radius: 10px;
      overflow: hidden;
      border: 2px solid transparent;
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .gallery-thumb.active { border-color: var(--accent); }
    .gallery-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

    .learn-list { display: flex; flex-direction: column; gap: 10px; }
    .learn-item {
      display: flex; align-items: flex-start; gap: 10px;
      background: var(--card2);
      border-radius: 12px;
      padding: 12px;
    }
    .learn-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
    .learn-text { font-size: 13px; color: var(--subtext); line-height: 1.5; }

    .cta {
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 14px;
      padding: 16px;
      font-size: 16px;
      font-weight: 800;
      width: 100%;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      margin-bottom: 8px;
      -webkit-tap-highlight-color: transparent;
    }
    .cta:active { opacity: 0.85; }

    .skeleton { animation: pulse 1.5s ease-in-out infinite; }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .sk-block {
      background: var(--border);
      border-radius: 8px;
      height: 16px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>

  <div id="root">
    <div class="hero" style="background: var(--card2);">
      <div class="skeleton" style="width:100%;height:100%;background:var(--border);"></div>
    </div>
    <div class="content">
      <div class="skeleton sk-block" style="width:70%;height:24px;"></div>
      <div class="skeleton sk-block" style="width:45%;"></div>
      <div class="skeleton sk-block" style="width:100%;height:60px;border-radius:16px;"></div>
      <div class="skeleton sk-block" style="width:100%;height:80px;border-radius:16px;"></div>
      <div class="skeleton sk-block" style="width:100%;"></div>
      <div class="skeleton sk-block" style="width:85%;"></div>
    </div>
  </div>

  <script>
    const AVATAR_COLORS = ['#6366F1','#EC4899','#10B981','#F59E0B','#3B82F6'];

    function getAvatarColor(name) {
      return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
    }

    function getInitials(name) {
      return name.split(' ').map(n => n[0] || '').join('').slice(0,2).toUpperCase();
    }

    function renderStars(rating) {
      const filled = Math.round(rating);
      let html = '<div class="stars">';
      for (let i = 0; i < 5; i++) {
        html += '<span class="star" style="color:' + (i < filled ? 'var(--star-on)' : 'var(--star-off)') + '">★</span>';
      }
      html += '<span class="rating-val">' + rating.toFixed(1) + '</span></div>';
      return html;
    }

    const LEARN_ITEMS = [
      { icon: '🎯', text: 'Core concepts and fundamentals of the subject' },
      { icon: '🛠️', text: 'Hands-on projects and real-world applications' },
      { icon: '📊', text: 'Industry best practices and modern techniques' },
      { icon: '🚀', text: 'Tips and shortcuts to accelerate your progress' },
    ];

    function render(course) {
      const root = document.getElementById('root');

      root.innerHTML = \`
        <!-- Hero -->
        <div class="hero">
          <img src="\${course.thumbnail}" alt="\${course.title}" onerror="this.style.display='none'"/>
          <div class="hero-scrim"></div>
          <div class="hero-badge">\${course.category}</div>
        </div>

        <div class="content">

          <!-- Chips -->
          <div class="chips">
            <span class="chip chip-indigo">📚 \${course.category}</span>
            <span class="chip chip-emerald">🏢 \${course.brand}</span>
          </div>

          <!-- Title -->
          <h1 class="title">\${course.title}</h1>

          <!-- Instructor -->
          <div class="instructor-card">
            <div class="avatar" style="background:\${getAvatarColor(course.instructor)}">
              \${getInitials(course.instructor)}
            </div>
            <div>
              <div class="instructor-label">Instructor</div>
              <div class="instructor-name">\${course.instructor}</div>
            </div>
          </div>

          <!-- Stars -->
          \${renderStars(course.rating)}

          <!-- Price -->
          <div class="price-block">
            <span class="price-icon">🏷️</span>
            <div>
              <div class="price-val">$\${course.price}</div>
              <div class="price-label">one-time payment</div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- About -->
          <div>
            <div class="section-label">About this course</div>
            <p class="description">\${course.description}</p>
          </div>

          <!-- Gallery -->
          \${course.images && course.images.length ? \`
          <div>
            <div class="section-label">Gallery</div>
            <div class="gallery-scroll" id="gallery">
              \${course.images.map((src, i) => \`
                <div class="gallery-thumb \${i === 0 ? 'active' : ''}" onclick="selectThumb(this, \${i})">
                  <img src="\${src}" alt="Course image \${i+1}" onerror="this.parentElement.style.display='none'"/>
                </div>
              \`).join('')}
            </div>
          </div>
          \` : ''}

          <div class="divider"></div>

          <!-- What you'll learn -->
          <div>
            <div class="section-label">What you'll learn</div>
            <div class="learn-list">
              \${LEARN_ITEMS.map(item => \`
                <div class="learn-item">
                  <span class="learn-icon">\${item.icon}</span>
                  <span class="learn-text">\${item.text}</span>
                </div>
              \`).join('')}
            </div>
          </div>

          <div class="divider"></div>

          <!-- CTA -->
          <button class="cta" onclick="handleEnroll()">
            🎓 Enroll Now — $\${course.price}
          </button>

        </div>
      \`;
    }

    function selectThumb(el, index) {
      document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
      el.classList.add('active');
    }

    function handleEnroll() {
      // Post message back to React Native
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ENROLL', courseId: window.courseData?.id }));
      }
    }

    window.addEventListener('courseLoaded', function () {
      if (window.courseData) render(window.courseData);
    });

    if (window.courseData) render(window.courseData);
  </script>
</body>
</html>
    `;
  }, [colorScheme]);

  const handleMessage = React.useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'ENROLL') {
        router.back();
      }
    }
    catch {}
  }, [router]);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-neutral-950" style={{ paddingBottom: insets.bottom }}>
      <Stack.Screen
        options={{
          title: course?.title ?? 'Course Content',
          headerBackTitle: 'Back',
        }}
      />

      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        injectedJavaScript={injectedJS}
        onMessage={handleMessage}
        onLoadStart={() => {
          setIsLoading(true);
          setHasError(false);
        }}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      />

      {isLoading && (
        <View className="absolute inset-0 items-center justify-center bg-gray-50 dark:bg-neutral-950">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="mt-3 text-sm font-medium text-gray-400 dark:text-gray-500">
            Loading course content…
          </Text>
        </View>
      )}

      {hasError && (
        <View
          className="absolute inset-0 items-center justify-center gap-y-3 bg-gray-50 px-8 dark:bg-neutral-950"
        >
          <Ionicons
            name="cloud-offline-outline"
            size={52}
            color={colorScheme === 'dark' ? '#7F1D1D' : '#F87171'}
          />
          <Text className="text-lg font-bold text-gray-700 dark:text-gray-300">
            Failed to load content
          </Text>
          <Text className="text-center text-sm text-gray-400 dark:text-gray-500">
            Check your connection and try again.
          </Text>
          <Pressable
            onPress={() => {
              setHasError(false);
              setIsLoading(true);
              webViewRef.current?.reload();
            }}
            className="mt-2 flex-row items-center rounded-xl bg-indigo-500 px-6 py-3 active:opacity-80 dark:bg-indigo-600"
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text className="ml-2 font-bold text-white">Retry</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
