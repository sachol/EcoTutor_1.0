
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Home, 
  Search, 
  BookOpen, 
  MessageSquare, 
  TrendingUp, 
  Calculator, 
  Info, 
  Send, 
  MapPin, 
  ArrowRight,
  ExternalLink,
  Loader2,
  Building2,
  ShieldCheck,
  LineChart,
  HelpCircle,
  X,
  CheckCircle2,
  Lightbulb,
  Layers,
  FileText,
  PieChart,
  ArrowUpRight,
  Download,
  AlertCircle,
  RotateCcw,
  ChevronLeft,
  Sparkles,
  BarChart3,
  TrendingDown,
  Upload,
  ImageIcon,
  FileSearch,
  AlertTriangle,
  ClipboardCheck,
  Eye,
  Paperclip,
  Activity,
  Zap,
  RefreshCw,
  PlayCircle,
  Trophy,
  GraduationCap,
  Target,
  Star,
  LayoutDashboard,
  Award,
  Link as LinkIcon,
  Globe,
  Coins,
  Gavel,
  BookCheck,
  BrainCircuit,
  History,
  ListChecks,
  Check,
  ZapOff,
  Compass,
  LayoutList,
  Sparkle,
  Settings,
  Key,
  TrainFront,
  FileBadge,
  ShieldAlert,
  SearchCode,
  Sun,
  Moon,
  Smartphone,
  MousePointer2,
  Terminal,
  Cpu,
  MonitorCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart as ReLineChart, 
  Line, 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

// --- Types ---
interface Message {
  role: 'user' | 'model';
  text: string;
  groundingSources?: { title: string; uri: string }[];
  suggestedQuestions?: string[];
  chartData?: ChartData;
  filePreview?: {
    name: string;
    type: string;
    url: string;
  };
  quizData?: QuizQuestion[];
  imageUrl?: string;
}

interface ChartData {
  chartType: 'line' | 'bar' | 'pie';
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  series: {
    name: string;
    data: { x: string; y: number }[];
  }[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface UserStats {
  points: number;
  level: string;
  completedQuizzes: number;
  correctAnswers: number;
  totalQuestions: number;
  wrongNotes: { question: string; answer: string; explanation: string; category: string }[];
  progress: {
    intro: number;
    intermediate: number;
    advanced: number;
  };
  learnedTopics: string[];
}

type ViewType = 'chat' | 'learning' | 'reports' | 'analysis' | 'simulation' | 'dashboard';
type ThemeType = 'light' | 'dark';

// --- Constants ---
const INITIAL_MESSAGES: Message[] = [{
  role: 'model',
  text: `안녕하세요! **EcoTutor: 부동산 경제 마스터**입니다. 🏠\n\n지능형 문답 학습을 통해 부동산 거시경제, 미시경제, 그리고 복잡한 정책과 세금을 완벽하게 마스터해 보세요. 학습하고 싶은 테마를 선택하거나 궁금한 점을 직접 물어보세요.`
}];

const CATEGORIZED_STARTERS = [
  {
    category: "거시경제 (Macro)",
    icon: Globe,
    color: "text-blue-600",
    bg: "bg-blue-50",
    starters: [
      "한국은행 기준금리 추이와 부동산 가격의 상관관계를 알려줘",
      "미국 연준(Fed) 금리 인상이 한국 부동산에 미치는 영향은?",
      "현재 부동산 사이클이 어느 단계인지 분석해줘",
      "인플레이션 시대에 실물 자산으로서 부동산의 가치 변화는?",
      "국내 가계부채 수준과 금리 변동이 부동산 시장에 미치는 하방 압력 분석"
    ]
  },
  {
    category: "미시경제 (Micro)",
    icon: Coins,
    color: "text-purple-600",
    bg: "bg-purple-50",
    starters: [
      "전세가율이 높으면 왜 매매가를 밀어올리는지 설명해줘",
      "특정 지역의 입주 물량과 전세가의 상관관계를 알려줘",
      "갭투자의 원리와 리스크 관리 방안을 요약해줘",
      "학군지와 역세권 중 하락장에서 방어력이 더 강한 곳은 어디야?",
      "랜드마크 대단지 아파트의 시세 변화가 주변 준신축 단지에 전이되는 속도 분석"
    ]
  },
  {
    category: "정책 및 세금 (Policy)",
    icon: Gavel,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    starters: [
      "최근 발표된 부동산 대책의 핵심 내용 3가지만 요약해줘",
      "LTV, DTI, DSR의 차이점과 대출 한도 계산법을 알려줘",
      "1주택자 양도세 비과세 요건과 절세 전략을 설명해줘",
      "분양가 상한제 지역과 해제 지역의 차이점과 투자 주의사항은?",
      "상속/증여 시 취득세 및 가액 산정 기준과 법인 투자의 장단점 비교"
    ]
  }
];

const SIMULATION_SCENARIOS = [
  {
    id: 'rate',
    title: "금리 변동 시나리오",
    desc: "기준금리 변동이 대출 상환 부담과 시장 가격에 미치는 나비효과",
    icon: TrendingUp,
    color: "text-rose-500",
    bg: "bg-rose-50",
    subTopics: [
      "기준금리 1%p 인상 시 영끌족의 이자 부담 증가 분석",
      "금리 인하기 진입 시 수익형 부동산 수익률 변화 예측",
      "전세자금대출 금리 급등과 역전세난의 상관관계"
    ]
  },
  {
    id: 'tax',
    title: "세제 개편 시나리오",
    desc: "취득, 보유, 양도 단계별 세 부담 변화에 따른 투자 전략",
    icon: Calculator,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    subTopics: [
      "취득세 중과세율 전면 폐지 시 시장 영향 시뮬레이션",
      "양도세 비과세 기준 상향이 상급지 갈아타기에 주는 영향",
      "종부세 공제액 확대가 매물 잠김에 주는 영향"
    ]
  },
  {
    id: 'supply',
    title: "공급 및 정비사업 시나리오",
    desc: "공인중개사와 투자자가 꼭 알아야 할 수급 및 재건축 이슈",
    icon: Building2,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    subTopics: [
      "공사비 폭등으로 인한 정비사업 중단이 3년 뒤 신축 공급에 미치는 영향",
      "재건축 초과이익 환수제 완화가 주요 단지별 사업성과 투자 수익률에 주는 변화",
      "서울 도심 내 인허가 물량 급감이 '얼죽신' 현상을 심화시키는 과정"
    ]
  },
  {
    id: 'location',
    title: "교통 및 인프라 시나리오",
    desc: "신규 노선 착공과 기업 유입이 입지 가치에 미치는 나비효과",
    icon: TrainFront,
    color: "text-amber-500",
    bg: "bg-amber-50",
    subTopics: [
      "GTX 노선별 개통 시점 앞뒤의 전세가와 매매가 변동 추이 비교",
      "대규모 반도체 클러스터 일자리 유입에 따른 주거지 상승률 시뮬레이션",
      "지하철 연장선 확정 발표가 저평가 지역에 주는 실질적 영향"
    ]
  }
];

const ANALYSIS_GUIDES = [
  {
    id: 'registry',
    title: "등기부 등본 분석",
    desc: "소유권 확인, 을구 채무 관계 및 권리 분석",
    icon: ShieldAlert,
    color: "text-rose-600",
    bg: "bg-rose-50",
    prompt: "이 등기부 등본 이미지에서 갑구의 소유권 변동 내역과 을구의 근저당 설정 현황을 분석해서 위험 요소를 알려줘."
  },
  {
    id: 'building',
    title: "건축물 대장 분석",
    desc: "용도 확인, 불법 건축물 여부 및 면적 검토",
    icon: Building2,
    color: "text-blue-600",
    bg: "bg-blue-50",
    prompt: "이 건축물 대장에서 주용도가 주거용인지 확인하고, 위반건축물 표기 여부와 면적 정보를 요약해줘."
  },
  {
    id: 'contract',
    title: "분양/매매 계약서",
    desc: "특약 사항 검토 및 권리 의무 관계 분석",
    icon: FileBadge,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    prompt: "이 부동산 계약서의 특약 사항 중에서 매수인에게 불리할 수 있는 독소 조항이 있는지 분석해줘."
  },
  {
    id: 'report',
    title: "매물/시세 보고서",
    desc: "데이터 시각화 및 시장 가치 정밀 평가",
    icon: PieChart,
    color: "text-purple-600",
    bg: "bg-purple-50",
    prompt: "이 매물 정보지의 시세 데이터와 주변 실거래가를 비교하여 현재 가격이 저평가인지 고평가인지 분석해줘."
  }
];

// --- Helpers ---
/**
 * Fix for Error: Cannot find name 'fileToBase64'.
 * Utility to convert a File object to a base64 string for Gemini API consumption.
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

// --- Components ---

const ThemeToggle: React.FC<{ theme: ThemeType; toggle: () => void }> = ({ theme, toggle }) => (
  <button 
    onClick={toggle}
    className={`p-2.5 rounded-2xl transition-all flex items-center gap-2 font-bold text-xs ${
      theme === 'dark' ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`}
  >
    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
  </button>
);

const ApiSettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; theme: ThemeType }> = ({ isOpen, onClose, theme }) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<string>('');
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const handleOpenSelect = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        alert("API 키 선택 대화상자가 열렸습니다. 설정을 완료한 후 테스트를 시도하세요.");
      } else {
        alert("window.aistudio 객체를 찾을 수 없습니다. 지원되는 환경인지 확인해 주세요.");
      }
    } catch (e) {
      alert("API 설정창을 여는 중 오류가 발생했습니다.");
    }
  };

  const handleTestKey = async (model: string) => {
    setTestStatus('loading');
    setTestResult('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let response;
      if (model.includes('image')) {
        response = await ai.models.generateContent({
          model,
          contents: [{ parts: [{ text: "ping" }] }],
        });
      } else {
        response = await ai.models.generateContent({
          model,
          contents: "Hello, confirm this API key works. Respond with 'API OK'."
        });
      }
      setTestResult(response.text || "응답이 비어있습니다.");
      setTestStatus('success');
    } catch (e: any) {
      setTestStatus('error');
      setTestResult(e.message || "연결 실패");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-[40px] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 border`}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>API 설정 및 테스트</h3>
            <button onClick={onClose} className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}><X size={20} /></button>
          </div>
          
          <div className="space-y-6">
            <div className={`p-5 rounded-3xl ${isDark ? 'bg-indigo-900/20 border-indigo-900/30' : 'bg-indigo-50 border-indigo-100'} border`}>
              <h4 className="text-sm font-black text-indigo-500 mb-2 flex items-center gap-2"><Key size={16} /> API 키 선택</h4>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-4`}>결제 수단이 등록된 유료 프로젝트의 API 키를 선택해야 모든 고급 기능을 사용할 수 있습니다.</p>
              <button onClick={handleOpenSelect} className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                <Settings size={18} /> API 키 선택창 열기
              </button>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[10px] text-indigo-400 hover:underline mt-2 block text-center">결제 관련 문서 확인하기</a>
            </div>

            <div className={`p-5 rounded-3xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border`}>
              <h4 className={`text-sm font-black ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-4 flex items-center gap-2`}><MonitorCheck size={16} /> 모델 연결 테스트</h4>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleTestKey('gemini-3-flash-preview')}
                  className={`py-2 px-3 rounded-xl text-[10px] font-black border transition-all ${isDark ? 'bg-slate-900 border-slate-700 hover:bg-indigo-600' : 'bg-white border-slate-200 hover:bg-indigo-600 hover:text-white'}`}
                >
                  Text Model Test
                </button>
                <button 
                  onClick={() => handleTestKey('gemini-3-pro-image-preview')}
                  className={`py-2 px-3 rounded-xl text-[10px] font-black border transition-all ${isDark ? 'bg-slate-900 border-slate-700 hover:bg-indigo-600' : 'bg-white border-slate-200 hover:bg-indigo-600 hover:text-white'}`}
                >
                  Visual AI Test
                </button>
              </div>

              {testStatus !== 'idle' && (
                <div className={`mt-4 p-3 rounded-xl text-xs font-bold flex items-center gap-3 ${
                  testStatus === 'loading' ? 'text-slate-400 bg-slate-400/5' :
                  testStatus === 'success' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
                }`}>
                  {testStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 
                   testStatus === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span className="truncate">{testResult || (testStatus === 'loading' ? 'Testing...' : '')}</span>
                </div>
              )}
            </div>
          </div>

          <button onClick={onClose} className="w-full mt-8 py-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-[20px] font-black hover:opacity-90 transition-all">설정 완료</button>
        </div>
      </div>
    </div>
  );
};

// --- Guide Modal ---
const GuideModal: React.FC<{ isOpen: boolean; onClose: () => void; theme: ThemeType }> = ({ isOpen, onClose, theme }) => {
  if (!isOpen) return null;
  const isDark = theme === 'dark';

  const sections = [
    {
      icon: MessageSquare,
      title: "지능형 문답 & 퀴즈 학습",
      value: "단순 정보를 넘어 거시경제 흐름과 정책을 AI와 실시간 토론하며 학습합니다. 학습 후 생성되는 퀴즈로 지식을 내재화하고 포인트를 얻으세요.",
      usage: "채팅창에 부동산 키워드나 궁금한 정책을 입력하거나, 추천 스타터를 클릭하여 대화를 시작하세요.",
      color: "indigo"
    },
    {
      icon: Activity,
      title: "정밀 시나리오 시뮬레이터",
      value: "금리, 공급, 교통망 등 미래 변수가 시세에 미치는 영향을 가상으로 체험하여 투자 확신을 얻고 리스크를 방어합니다.",
      usage: "시뮬레이션 탭에서 시나리오 카드를 선택하고 세부 주제를 클릭하여 변화 양상을 분석받으세요.",
      color: "rose"
    },
    {
      icon: FileSearch,
      title: "부동산 문서 정밀 분석 (OCR)",
      value: "복잡한 서류 속 위험 요소를 AI가 즉시 판독하여 전세 사기나 불리한 계약으로부터 자산을 보호합니다.",
      usage: "문서 분석 탭에서 등기부나 계약서 사진을 업로드하고 유형별 가이드를 클릭해 권리 관계를 확인하세요.",
      color: "emerald"
    },
    {
      icon: LayoutDashboard,
      title: "학습 매니저 (Dashboard)",
      value: "자신의 학습 진척도와 포인트, 등급을 관리하며 체계적인 부동산 전문가 로드맵을 따라갈 수 있습니다.",
      usage: "대시보드에서 커리큘럼별 퀴즈를 풀고 누적된 포인트를 확인하며 상급 코스에 도전하세요.",
      color: "amber"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-[48px] shadow-2xl max-w-3xl w-full overflow-hidden animate-in zoom-in-95 border max-h-[90vh] flex flex-col`}>
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-8">
            <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-900/30 animate-pulse"><Sparkles size={28} /></div>
            <button onClick={onClose} className={`p-3 ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} rounded-full transition-colors`}><X size={24} className={isDark ? 'text-slate-500' : 'text-slate-400'} /></button>
          </div>
          
          <h3 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}>EcoTutor 사용 가이드 🏠</h3>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium mb-10 text-lg`}>도시아재(신화부동산)가 설계한 차세대 부동산 경제 지능형 튜터</p>
          
          <div className="space-y-12">
            {sections.map((s, idx) => (
              <div key={idx} className="flex gap-6 group">
                <div className={`shrink-0 w-16 h-16 rounded-3xl bg-${s.color}-500/10 text-${s.color}-500 flex items-center justify-center group-hover:scale-110 transition-transform`}><s.icon size={32} /></div>
                <div>
                  <h4 className={`text-xl font-black ${isDark ? 'text-slate-100' : 'text-slate-800'} mb-2`}>{s.title}</h4>
                  <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} border ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'} font-bold mb-3`}>
                      <span className="text-indigo-500">기능적 가치:</span> {s.value}
                    </p>
                    <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-500'} font-medium`}>
                      <span className="font-black">사용 방법:</span> {s.usage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center">
            <p className="text-xs font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em] mb-6">제작: 도시아재(신화부동산)</p>
            <button onClick={onClose} className="w-full py-5 bg-indigo-600 text-white rounded-[28px] font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 active:scale-[0.98]">지능형 학습 시작하기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Fix for Error: Cannot find name 'QuizView'.
 * Interactive Quiz Component to render AI-generated quiz questions and handle user interaction.
 */
const QuizView: React.FC<{ 
  questions: QuizQuestion[]; 
  onComplete: (score: number, total: number) => void;
  theme: ThemeType;
}> = ({ questions, onComplete, theme }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const isDark = theme === 'dark';

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelected(idx);
    setIsAnswered(true);
    if (idx === questions[currentIdx].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
      setIsAnswered(false);
    } else {
      const finalScore = score + (selected === questions[currentIdx].correctAnswer ? 0 : 0);
      onComplete(score, questions.length);
    }
  };

  const q = questions[currentIdx];

  return (
    <div className={`mt-6 p-6 rounded-3xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">부동산 경제 퀴즈 ({currentIdx + 1}/{questions.length})</span>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500 shadow-sm'}`}>점수: {score}</div>
      </div>
      
      <h5 className={`text-lg font-black mb-6 leading-snug ${isDark ? 'text-white' : 'text-slate-800'}`}>{q.question}</h5>
      
      <div className="space-y-3 mb-8">
        {q.options.map((opt, idx) => {
          let stateStyles = isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
          if (isAnswered) {
            if (idx === q.correctAnswer) stateStyles = 'bg-emerald-500 text-white border-emerald-500';
            else if (idx === selected) stateStyles = 'bg-rose-500 text-white border-rose-500';
            else stateStyles = 'opacity-50 cursor-not-allowed';
          }
          return (
            <button 
              key={idx} 
              onClick={() => handleAnswer(idx)}
              className={`w-full text-left p-4 rounded-2xl border text-sm font-bold transition-all flex items-center gap-3 ${stateStyles}`}
            >
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] border ${isAnswered && idx === q.correctAnswer ? 'bg-white/20 border-transparent' : ''}`}>{idx + 1}</span>
              {opt}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className={`p-4 rounded-2xl mb-6 text-xs font-bold leading-relaxed ${isDark ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>
            <div className="flex items-center gap-2 mb-2 font-black uppercase text-[10px] text-indigo-500">
              <Lightbulb size={14} /> 정답 해설
            </div>
            {q.explanation}
          </div>
          <button onClick={nextQuestion} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
            {currentIdx < questions.length - 1 ? "다음 문제" : "결과 확인"} <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

// --- App Component ---
const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [theme, setTheme] = useState<ThemeType>('light');
  const [userStats, setUserStats] = useState<UserStats>({
    points: 120,
    level: '입문 튜티',
    completedQuizzes: 2,
    correctAnswers: 8,
    totalQuestions: 10,
    wrongNotes: [],
    progress: { intro: 25, intermediate: 10, advanced: 0 },
    learnedTopics: ["LTV/DTI/DSR", "전세가율의 의미"]
  });
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (messages.length === 0) {
      setMessages(INITIAL_MESSAGES);
      if (!localStorage.getItem('hasVisitedEcotutor')) {
        setIsGuideOpen(true);
        localStorage.setItem('hasVisitedEcotutor', 'true');
      }
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, activeView]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleSend = async (overrideText?: string, file?: File | null) => {
    const query = overrideText || input;
    const currentFile = file || pendingFile;
    if (!query.trim() && !currentFile) return;
    if (isLoading) return;

    if (activeView !== 'chat') setActiveView('chat');
    
    const userMsg: Message = { role: 'user', text: query || (currentFile ? `${currentFile.name} 분석` : '') };
    if (currentFile) {
        userMsg.filePreview = {
            name: currentFile.name,
            type: currentFile.type,
            url: URL.createObjectURL(currentFile)
        };
    }
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const contents: any[] = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      
      const currentParts: any[] = [{ text: query }];
      if (currentFile) {
        const base64Data = await fileToBase64(currentFile);
        currentParts.push({ 
          inlineData: { 
            data: base64Data, 
            mimeType: currentFile.type 
          } 
        });
      }
      contents.push({ role: 'user', parts: currentParts });

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents,
        config: {
          systemInstruction: `당신은 부동산 경제 전문 튜터 'EcoTutor'입니다. 제작자는 '도시아재(신화부동산)'입니다.
          [학습 지침]
          - 사용자가 퀴즈를 요청하면 반드시 \`\`\`quiz-data 블록 안에 JSON으로 응답하세요.
          - 모든 분석은 최신 정책과 데이터를 근거로 상세하게 설명하세요.
          - 문서 분석 시(등기부등본 등), 이미지나 PDF 내용을 정밀하게 판독하여 위험 요소와 핵심 정보를 짚어주세요.
          - 마지막에는 항상 심화 질문 3개를 추천해 주세요.`,
          tools: [{ googleSearch: {} }]
        }
      });

      let displayText = response.text || "응답 오류";
      let quizData: QuizQuestion[] | undefined;
      let imageUrl: string | undefined;

      const quizMatch = displayText.match(/```quiz-data\s*([\s\S]*?)\s*```/);
      if (quizMatch) {
        try { 
          quizData = JSON.parse(quizMatch[1].trim()); 
          displayText = displayText.replace(quizMatch[0], "\n\n**[퀴즈가 생성되었습니다! 아래에서 도전하세요]**").trim();
        } catch(e) {}
      }

      // Check if model returned an image (relevant if model supported it)
      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart) {
        imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: displayText, 
        quizData,
        imageUrl,
        groundingSources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(c => c.web).map(c => ({ title: c.web!.title || '출처', uri: c.web!.uri }))
      }]);
      setPendingFile(null);
    } catch (e: any) {
      if (e.message?.includes("entity was not found")) {
        alert("API 키가 잘못되었거나 만료되었습니다. 다시 설정해 주세요.");
        setIsApiSettingsOpen(true);
      }
      setMessages(prev => [...prev, { role: 'model', text: "시스템 오류입니다. API 설정을 확인해 주세요." }]);
    } finally { setIsLoading(false); }
  };

  const handleAnalysisStart = (prompt: string) => {
    if (!pendingFile) {
        alert("먼저 분석할 문서를 업로드해 주세요.");
        fileInputRef.current?.click();
        return;
    }
    handleSend(prompt);
  };

  const NavButton = ({ view, icon: Icon, label }: any) => (
    <button onClick={() => setActiveView(view)} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold transition-all text-left ${activeView === view ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100')}`}>
      <Icon size={20} /> {label}
    </button>
  );

  return (
    <div className={`flex h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} overflow-hidden w-full font-sans transition-colors duration-300`}>
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} theme={theme} />
      <ApiSettingsModal isOpen={isApiSettingsOpen} onClose={() => setIsApiSettingsOpen(false)} theme={theme} />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => setPendingFile(e.target.files?.[0] || null)} 
        className="hidden" 
        accept="image/*,application/pdf" 
      />

      <aside className={`hidden md:flex flex-col w-64 ${isDark ? 'bg-slate-900' : 'bg-slate-900'} text-white p-6 shrink-0 shadow-2xl`}>
        <div className="flex items-center gap-2 mb-10"><div className="bg-indigo-600 p-2 rounded-lg"><Building2 size={24} /></div><h1 className="text-xl font-bold italic">EcoTutor</h1></div>
        <nav className="flex-1 space-y-2">
          <NavButton view="chat" icon={BrainCircuit} label="지능형 문답 학습" />
          <NavButton view="dashboard" icon={LayoutDashboard} label="학습 매니저" />
          <NavButton view="simulation" icon={Activity} label="시나리오 시뮬레이터" />
          <NavButton view="analysis" icon={FileSearch} label="문서 분석" />
        </nav>
        
        <div className="mt-auto space-y-4">
          <button onClick={() => setIsApiSettingsOpen(true)} className="w-full flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700">
            <Key size={18} className="text-amber-500" />
            <span className="text-xs font-black text-slate-300">API 설정</span>
          </button>
          <div className="p-4 bg-slate-800 rounded-2xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">제작: 도시아재(신화부동산)</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        <header className={`h-16 border-b ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white/80'} backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0 transition-colors duration-300`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            {activeView === 'chat' && <><BrainCircuit size={18} className="text-indigo-600" /> 지능형 문답 학습</>}
            {activeView === 'dashboard' && <><LayoutDashboard size={18} className="text-indigo-600" /> 학습 매니저</>}
            {activeView === 'simulation' && <><Activity size={18} className="text-indigo-600" /> 시뮬레이션</>}
            {activeView === 'analysis' && <><FileSearch size={18} className="text-indigo-600" /> 문서 분석</>}
          </h2>
          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} toggle={toggleTheme} />
            <button onClick={() => setIsGuideOpen(true)} className={`p-2.5 ${isDark ? 'bg-slate-800 text-indigo-400 hover:bg-slate-700' : 'bg-slate-100 text-indigo-600 hover:bg-slate-200'} rounded-2xl transition-all shadow-sm`} title="앱 설명보기">
                <Info size={18} />
            </button>
            <div className={`flex items-center gap-1.5 text-sm font-black text-amber-500 ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-100'} px-4 py-1.5 rounded-2xl border`}>
                <Star size={14} fill="currentColor" /> {userStats.points} pts
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 h-full custom-scrollbar">
          {activeView === 'chat' && (
            <div className="space-y-12 pb-32 max-w-4xl mx-auto">
              {messages.length <= 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="text-center mb-10">
                    <div className={`inline-flex p-4 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'} text-indigo-600 rounded-3xl mb-4`}><Sparkle size={36} /></div>
                    <h3 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}>지능형 부동산 문답 학습</h3>
                    <p className={`${isDark ? 'text-slate-500' : 'text-slate-500'} font-medium`}>거시경제 흐름부터 정밀 세무 전략까지, AI 전문가와 대화하세요.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {CATEGORIZED_STARTERS.map((cat, idx) => (
                      <div key={idx} className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-[32px] border p-6 shadow-sm transition-colors`}>
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`p-2 rounded-xl ${cat.bg} ${cat.color}`}><cat.icon size={20} /></div>
                          <h4 className={`font-black text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{cat.category}</h4>
                        </div>
                        <div className="space-y-2.5">
                          {cat.starters.map((s, i) => (
                            <button key={i} onClick={() => handleSend(s)} className={`w-full text-left p-3.5 rounded-2xl ${isDark ? 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-indigo-400 hover:bg-slate-800' : 'bg-slate-50 border-slate-100 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'} border text-xs font-bold transition-all line-clamp-2 leading-snug`}>{s}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {messages.length > 1 && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-[32px] px-6 py-5 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : (isDark ? 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none' : 'bg-white border-slate-200 text-slate-800 rounded-tl-none')}`}>
                        {msg.filePreview && (
                            <div className={`mb-4 p-3 ${isDark ? 'bg-black/20 border-white/5' : 'bg-black/5 border-black/10'} rounded-2xl flex items-center gap-3 border`}>
                                <FileText size={18} className="text-slate-500" />
                                <span className="text-xs font-bold truncate">{msg.filePreview.name}</span>
                            </div>
                        )}
                        {msg.imageUrl && (
                          <div className="mb-4 rounded-2xl overflow-hidden border border-black/10">
                            <img src={msg.imageUrl} alt="AI Generated" className="w-full h-auto" />
                          </div>
                        )}
                        <div className="prose prose-slate dark:prose-invert max-w-none prose-sm"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
                        {msg.quizData && <QuizView questions={msg.quizData} onComplete={(s, t) => { setUserStats(prev => ({...prev, points: prev.points + (s*20), completedQuizzes: prev.completedQuizzes + 1})); handleSend("학습 완료!"); }} theme={theme} />}
                        {msg.groundingSources && msg.groundingSources.length > 0 && (
                          <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'} flex flex-wrap gap-2`}>
                            {msg.groundingSources.map((src, idx) => (
                              <a key={idx} href={src.uri} target="_blank" rel="noopener noreferrer" className={`px-2 py-1 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'} border rounded-lg text-[10px] font-bold hover:border-indigo-500 transition-colors`}>{src.title}</a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {isLoading && <div className="flex justify-start animate-pulse"><div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-full px-6 py-3 text-xs font-bold text-slate-500 flex items-center gap-2`}><Loader2 size={16} className="animate-spin" /> AI가 분석 중입니다...</div></div>}
            </div>
          )}

          {activeView === 'dashboard' && (
            <div className="max-w-6xl mx-auto pb-32 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-6 rounded-[32px] border shadow-sm`}>
                  <p className="text-[10px] font-black text-slate-400 mb-1">포인트</p>
                  <h4 className="text-2xl font-black">{userStats.points} pts</h4>
                </div>
                <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-6 rounded-[32px] border shadow-sm`}>
                  <p className="text-[10px] font-black text-slate-400 mb-1">완료 퀴즈</p>
                  <h4 className="text-2xl font-black">{userStats.completedQuizzes} 회</h4>
                </div>
                <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-6 rounded-[32px] border shadow-sm`}>
                  <p className="text-[10px] font-black text-slate-400 mb-1">등급</p>
                  <h4 className="text-2xl font-black text-indigo-600">{userStats.level}</h4>
                </div>
              </div>
              <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-8 rounded-[40px] border`}>
                <h4 className="text-lg font-black mb-6">커리큘럼 학습 현황</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { id: 'intro', title: '입문 코스', desc: '대출/세금 기초', icon: BookOpen, color: 'bg-blue-500' },
                    { id: 'intermediate', title: '중급 코스', desc: '수급/갭투자 분석', icon: TrendingUp, color: 'bg-purple-500' },
                    { id: 'advanced', title: '고급 코스', desc: '절세/사이클 전략', icon: Award, color: 'bg-amber-500' }
                  ].map(course => (
                    <div key={course.id} className={`${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'} p-6 rounded-[32px] border group hover:border-indigo-500/50 transition-all`}>
                      <div className={`w-12 h-12 ${course.color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg`}><course.icon size={24} /></div>
                      <h5 className="font-black text-slate-800 dark:text-slate-200 mb-1">{course.title}</h5>
                      <p className="text-[11px] text-slate-500 mb-4">{course.desc}</p>
                      <button onClick={() => handleSend(`${course.title} 관련 퀴즈 내줘`)} className={`w-full py-2.5 ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-indigo-600' : 'bg-white border-slate-200 hover:bg-indigo-600'} border rounded-xl text-xs font-black hover:text-white transition-all`}>퀴즈 시작</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeView === 'simulation' && (
            <div className="max-w-6xl mx-auto pb-32 animate-in fade-in duration-500">
              <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'} mb-8`}>지능형 시나리오 시뮬레이션 🧪</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {SIMULATION_SCENARIOS.map((s) => (
                  <div key={s.id} className={`${isDark ? 'bg-slate-900 border-slate-800 hover:border-indigo-900' : 'bg-white border-slate-200 hover:border-indigo-200'} p-8 rounded-[40px] border shadow-sm flex flex-col transition-all group`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-3xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}><s.icon size={28} /></div>
                      <h4 className={`text-xl font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{s.title}</h4>
                    </div>
                    <p className={`text-sm mb-8 flex-grow ${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium leading-relaxed`}>{s.desc}</p>
                    <div className="space-y-2.5">
                      {s.subTopics.map((topic, tidx) => (
                        <button key={tidx} onClick={() => handleSend(topic)} className={`w-full p-4 text-left ${isDark ? 'bg-indigo-900/10 border-indigo-900/30 text-indigo-400 hover:bg-indigo-900/20' : 'bg-indigo-50 border-indigo-100 text-indigo-800 hover:bg-indigo-100'} border rounded-2xl text-xs font-bold flex justify-between items-center transition-all group/btn`}>
                          <span className="line-clamp-2">{topic}</span>
                          <ArrowUpRight size={14} className="shrink-0 opacity-40 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'analysis' && (
            <div className="max-w-5xl mx-auto pb-32 animate-in fade-in duration-500">
              <div className="text-center mb-10">
                <h3 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}>부동산 문서 정밀 분석 🔎</h3>
                <p className={`${isDark ? 'text-slate-500' : 'text-slate-500'} font-medium`}>등기부등본, 건축물대장, 계약서 등을 업로드하여 AI 권리분석을 받으세요.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`h-80 rounded-[48px] border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group ${
                            pendingFile ? (isDark ? 'border-indigo-600 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50') : (isDark ? 'border-slate-800 bg-slate-900/50 hover:border-indigo-600 hover:bg-slate-900' : 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50')
                        }`}
                    >
                        {!pendingFile ? (
                            <>
                                <div className={`w-20 h-20 ${isDark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600'} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <Upload size={36} />
                                </div>
                                <h4 className={`text-xl font-black ${isDark ? 'text-slate-200' : 'text-slate-800'} mb-1`}>분석할 문서 업로드</h4>
                                <p className="text-sm text-slate-500 font-bold">이미지 또는 PDF 파일을 선택하세요.</p>
                            </>
                        ) : (
                            <div className="text-center p-6">
                                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                                    <FileText size={36} />
                                </div>
                                <h4 className={`text-xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-800'} mb-1`}>업로드 완료!</h4>
                                <p className={`text-sm ${isDark ? 'text-emerald-500/60' : 'text-emerald-600'} font-black mb-4 truncate max-w-xs`}>{pendingFile.name}</p>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setPendingFile(null); }}
                                    className="px-6 py-2.5 bg-rose-500 text-white rounded-2xl text-xs font-black hover:bg-rose-600 transition-colors shadow-lg shadow-rose-900/20"
                                >
                                    파일 삭제
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-6 rounded-[32px] border shadow-sm`}>
                        <h4 className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'} mb-4 flex items-center gap-2`}>
                            <Lightbulb size={16} className="text-amber-500" /> 분석 가이드
                        </h4>
                        <ul className="space-y-4">
                            {[1, 2, 3].map(num => (
                                <li key={num} className="flex gap-3 items-start">
                                    <div className="w-6 h-6 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{num}</div>
                                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} leading-relaxed font-bold`}>
                                        {num === 1 && "분석할 문서를 선명하게 촬영하여 업로드하세요."}
                                        {num === 2 && "아래의 유형별 빠른 분석 버튼을 선택하세요."}
                                        {num === 3 && "AI가 권리 관계의 사각지대를 정밀 분석합니다."}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ANALYSIS_GUIDES.map((guide) => (
                    <button 
                        key={guide.id}
                        onClick={() => handleAnalysisStart(guide.prompt)}
                        className={`${isDark ? 'bg-slate-900 border-slate-800 hover:border-indigo-900' : 'bg-white border-slate-200 hover:border-indigo-300'} p-6 rounded-[32px] border shadow-sm hover:shadow-md transition-all text-left group flex flex-col h-full`}
                    >
                        <div className={`w-12 h-12 ${guide.bg} ${guide.color} rounded-2xl flex items-center justify-center mb-4 shrink-0 group-hover:rotate-6 transition-transform`}>
                            <guide.icon size={24} />
                        </div>
                        <h4 className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'} mb-2`}>{guide.title}</h4>
                        <p className={`text-[11px] font-medium mb-6 flex-grow ${isDark ? 'text-slate-500' : 'text-slate-500'} leading-relaxed`}>{guide.desc}</p>
                        <div className={`pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-50'} mt-auto flex items-center justify-between`}>
                            <span className="text-[10px] font-black text-indigo-600 uppercase">분석 실행</span>
                            <ArrowRight size={14} className="text-indigo-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={`absolute bottom-0 left-0 right-0 p-6 ${isDark ? 'bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent' : 'bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent'}`}>
          <div className="max-w-3xl mx-auto">
            {pendingFile && activeView !== 'analysis' && (
                <div className="mb-4 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg">
                        <FileText size={14} /> {pendingFile.name} (대기 중)
                        <button onClick={() => setPendingFile(null)} className="ml-2 hover:bg-white/20 rounded-full p-0.5"><X size={12} /></button>
                    </div>
                </div>
            )}
            <div className={`flex items-center ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} rounded-[32px] shadow-2xl border overflow-hidden px-2 transition-all backdrop-blur-md`}>
                <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className={`p-4 transition-colors ${pendingFile ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}
                >
                    <Paperclip size={22} />
                </button>
                <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={pendingFile ? "문서 분석 질문을 입력하세요..." : "부동산 경제에 대해 무엇이든 물어보세요..."} 
                className={`flex-1 py-5 px-2 bg-transparent border-none focus:ring-0 text-sm font-bold ${isDark ? 'text-slate-100 placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'}`} 
                />
                <button onClick={() => handleSend()} disabled={isLoading || (!input.trim() && !pendingFile)} className="p-4 my-1 mr-1 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-lg shadow-indigo-900/20 active:scale-95">
                {isLoading ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
                </button>
            </div>
          </div>
        </div>
      </main>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: ${isDark ? '#334155' : '#cbd5e1'}; 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: ${isDark ? '#475569' : '#94a3b8'}; 
        }
      `}</style>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) createRoot(rootElement).render(<App />);
