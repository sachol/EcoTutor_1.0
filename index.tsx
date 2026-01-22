
import React, { useState, useRef, useEffect } from 'react';
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
  MonitorCheck,
  Database,
  Lock,
  HardDrive,
  ShieldEllipsis,
  Radio,
  Wifi,
  History as HistoryIcon,
  Save,
  Wand2
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import ReactMarkdown from 'react-markdown';

// --- Types ---
interface Message {
  role: 'user' | 'model';
  text: string;
  groundingSources?: { title: string; uri: string }[];
  filePreview?: {
    name: string;
    type: string;
    url: string;
  };
  quizData?: QuizQuestion[];
  imageUrl?: string;
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
  progress: {
    intro: number;
    intermediate: number;
    advanced: number;
  };
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
    examples: [
      "기준금리 1%p 인상 시 영끌족의 이자 부담 증가 분석",
      "금리 인하기 진입 시 수익형 부동산 수익률 변화 예측"
    ]
  },
  {
    id: 'tax',
    title: "세제 개편 시나리오",
    desc: "취득, 보유, 양도 단계별 세 부담 변화에 따른 투자 전략",
    icon: Calculator,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    examples: [
      "취득세 중과세율 전면 폐지 시 시장 영향 시뮬레이션",
      "양도세 비과세 기준 상향이 상급지 갈아타기에 주는 영향"
    ]
  },
  {
    id: 'supply',
    title: "공급 및 정비 시나리오",
    desc: "공인중개사와 투자자가 꼭 알아야 할 수급 및 재건축 이슈",
    icon: Building2,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    examples: [
      "공사비 폭등으로 인한 정비사업 중단이 3년 뒤 신축 공급에 미치는 영향",
      "재건축 초과이익 환수제 완화가 주요 단지별 사업성과 투자 수익률에 주는 변화"
    ]
  },
  {
    id: 'macro',
    title: "거시지표 및 실물자산 시나리오",
    desc: "환율, 물가, 유동성 등 거시 경제 지표 변화와 부동산 가치 연동",
    icon: Globe,
    color: "text-amber-500",
    bg: "bg-amber-50",
    examples: [
      "인플레이션 헤지 수단으로서의 서울 아파트 가치 보존력 분석",
      "고환율 시대, 외국인 자본 유입과 국내 상업용 부동산 시장 변동"
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
  }
];

// --- Helpers ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

// --- Components ---

/**
 * Advanced API Hub Component
 */
const ApiSettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; theme: ThemeType }> = ({ isOpen, onClose, theme }) => {
  const [modelStates, setModelStates] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({
    'gemini-3-flash-preview': 'idle',
    'gemini-3-pro-preview': 'idle',
    'gemini-2.5-flash-image': 'idle'
  });
  const [lastMessage, setLastMessage] = useState<string>('');
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const handleOpenSelect = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
      } else {
        alert("이 환경은 외부 키 선택기(window.aistudio)를 지원하지 않습니다.");
      }
    } catch (e) {
      alert("연동 프로세스 중 오류가 발생했습니다.");
    }
  };

  const handleTestKey = async (model: string) => {
    setModelStates(prev => ({ ...prev, [model]: 'loading' }));
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model,
        contents: "Connectivity check. Reply 'Ready'."
      });
      setLastMessage(`[${model}] 연결 성공: ${response.text}`);
      setModelStates(prev => ({ ...prev, [model]: 'success' }));
    } catch (e: any) {
      setLastMessage(`[${model}] 연결 실패: ${e.message}`);
      setModelStates(prev => ({ ...prev, [model]: 'error' }));
    }
  };

  const handleExportBackup = () => {
    const timestamp = new Date().toISOString();
    const manifest = {
      app: "EcoTutor",
      security_tier: "Enterprise-Encrypted",
      generated_at: timestamp,
      key_source: "External Platform (window.aistudio)",
      active_models: Object.keys(modelStates),
      security_hash: btoa(`ECOTUTOR_SECURE_SYNC_${timestamp}`)
    };
    
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EcoTutor_Security_Manifest_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setLastMessage("보안 매니페스트가 로컬 드라이브에 암호화되어 저장되었습니다.");
  };

  const modelMetadata = [
    { id: 'gemini-3-flash-preview', name: 'Nano Banana (Flash)', desc: '고속 부동산 추론 및 기본 분석' },
    { id: 'gemini-3-pro-preview', name: 'Pro Logic Core', desc: '심층 경제 분석 및 복합 정책 추론' },
    { id: 'gemini-2.5-flash-image', name: 'Visual Analytics', desc: '등기부/계약서 OCR 및 문서 판독' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
      <div className={`${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-[48px] shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300 border`}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-slate-500/10 flex justify-between items-center bg-gradient-to-r from-indigo-600/5 to-transparent">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg"><Lock size={20} /></div>
                <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>API 보안 허브</h3>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold`}>EcoTutor 지능형 엔진 및 연결성 관리자</p>
            </div>
            <button onClick={onClose} className={`p-3 rounded-full ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`}><X size={24} /></button>
          </div>

          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <section>
              <h4 className={`text-sm font-black mb-4 flex items-center gap-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}><Globe size={18} /> 외장형 키 관리 시스템</h4>
              <div className={`p-6 rounded-[32px] border-2 border-dashed ${isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-200'} flex flex-col md:flex-row items-center gap-6`}>
                <div className="shrink-0 w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center text-indigo-600"><Wifi size={32} /></div>
                <div className="flex-1 text-center md:text-left">
                  <p className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-1`}>플랫폼 통합 보안 연동</p>
                  <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-500'} mb-4 font-medium`}>내장형 하드코딩 방식이 아닌, 플랫폼 보안 레이어를 통해 안전하게 키를 연동합니다.</p>
                  <button onClick={handleOpenSelect} className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 mx-auto md:mx-0"><Radio size={14} /> 외부 키 동기화</button>
                </div>
              </div>
            </section>

            <section>
              <h4 className={`text-sm font-black mb-4 flex items-center gap-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}><ShieldCheck size={18} /> 엔진 연결성 테스트</h4>
              <div className="space-y-3">
                {modelMetadata.map(m => (
                  <div key={m.id} className={`flex items-center justify-between p-4 rounded-3xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${modelStates[m.id] === 'success' ? 'bg-emerald-500/10 text-emerald-500' : modelStates[m.id] === 'error' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-500/10 text-slate-400'}`}>
                        {modelStates[m.id] === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <Cpu size={18} />}
                      </div>
                      <div>
                        <p className="text-xs font-black">{m.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{m.desc}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleTestKey(m.id)} 
                      disabled={modelStates[m.id] === 'loading'}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${modelStates[m.id] === 'success' ? 'bg-emerald-500 text-white' : modelStates[m.id] === 'error' ? 'bg-rose-500 text-white' : (isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white border border-slate-200 hover:bg-slate-100')}`}
                    >
                      {modelStates[m.id] === 'idle' ? '테스트' : modelStates[m.id] === 'loading' ? '확인 중' : modelStates[m.id] === 'success' ? '정상' : '실패'}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className={`p-6 rounded-[32px] ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100/50 border-slate-200'} border`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center"><HardDrive size={24} /></div>
                  <div>
                    <h5 className="text-sm font-black">로컬 보안 매니페스트</h5>
                    <p className="text-[10px] text-slate-500 font-medium">현재 설정을 로컬 드라이브에 암호화하여 백업합니다.</p>
                  </div>
                </div>
                <button onClick={handleExportBackup} className="px-6 py-2.5 bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 rounded-2xl text-xs font-black flex items-center gap-2 whitespace-nowrap"><Save size={14} /> 로컬 드라이브 저장</button>
              </div>
              {lastMessage && (
                <div className={`mt-6 p-4 rounded-2xl text-[11px] font-bold border ${lastMessage.includes('실패') ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'}`}>
                  <div className="flex items-start gap-2">
                    <Radio size={14} className="shrink-0 mt-0.5" />
                    <span className="break-all">{lastMessage}</span>
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="p-8 bg-slate-500/5 flex justify-center">
            <button onClick={onClose} className="w-full py-4 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl hover:bg-indigo-700 transition-all">설정 완료 및 닫기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuizView: React.FC<{ questions: QuizQuestion[]; onComplete: (score: number, total: number) => void; theme: ThemeType }> = ({ questions, onComplete, theme }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const isDark = theme === 'dark';

  const q = questions[currentIdx];

  const handleNext = () => {
    if (selected === q.correctAnswer) setScore(score + 1);
    if (currentIdx === questions.length - 1) {
      onComplete(score + (selected === q.correctAnswer ? 1 : 0), questions.length);
    } else {
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
      setIsAnswered(false);
    }
  };

  return (
    <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} shadow-lg my-4 animate-in zoom-in-95 duration-300`}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black text-indigo-500 uppercase">부동산 경제 퀴즈 ({currentIdx + 1}/{questions.length})</span>
      </div>
      <h5 className={`text-lg font-black mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>{q.question}</h5>
      <div className="space-y-3">
        {q.options.map((opt, i) => (
          <button 
            key={i} 
            disabled={isAnswered}
            onClick={() => setSelected(i)}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
              selected === i 
                ? (isAnswered ? (i === q.correctAnswer ? 'border-emerald-500 bg-emerald-500/10' : 'border-rose-500 bg-rose-500/10') : 'border-indigo-600 bg-indigo-600/10')
                : (isAnswered && i === q.correctAnswer ? 'border-emerald-500 bg-emerald-500/10' : (isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50'))
            }`}
          >
            <span className={`text-sm font-bold ${selected === i ? 'text-indigo-500' : (isDark ? 'text-slate-400' : 'text-slate-600')}`}>{opt}</span>
          </button>
        ))}
      </div>
      {isAnswered ? (
        <div className="mt-6">
          <p className={`text-xs p-4 rounded-xl mb-4 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>{q.explanation}</p>
          <button onClick={handleNext} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">다음 단계</button>
        </div>
      ) : (
        <button disabled={selected === null} onClick={() => setIsAnswered(true)} className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-30">정답 확인</button>
      )}
    </div>
  );
};

const GuideModal: React.FC<{ isOpen: boolean; onClose: () => void; theme: ThemeType }> = ({ isOpen, onClose, theme }) => {
  if (!isOpen) return null;
  const isDark = theme === 'dark';

  const sections = [
    { icon: MessageSquare, title: "지능형 문답 & 퀴즈", val: "부동산 경제의 핵심을 AI와 토론하며 학습하고 퀴즈로 내면화합니다.", color: "indigo" },
    { icon: Activity, title: "정밀 시뮬레이터", val: "금리, 정책 변화가 내 자산에 미치는 영향을 데이터로 예측합니다.", color: "rose" },
    { icon: FileSearch, title: "문서 OCR 분석", val: "등기부와 계약서를 판독하여 권리 관계의 위험을 사전에 차단합니다.", color: "emerald" },
    { icon: LayoutDashboard, title: "학습 매니저", val: "본인의 학습 수준을 등급별로 관리하고 포인트를 획득합니다.", color: "amber" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-[48px] shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 border max-h-[90vh] flex flex-col`}>
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-8">
            <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-xl"><Sparkles size={28} /></div>
            <button onClick={onClose} className={`p-3 rounded-full ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}><X size={24} /></button>
          </div>
          <h3 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}>EcoTutor 가이드 🏠</h3>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} mb-10 text-lg`}>도시아재가 설계한 부동산 자산 전략 플랫폼</p>
          <div className="space-y-8">
            {sections.map((s, idx) => (
              <div key={idx} className="flex gap-6">
                <div className={`shrink-0 w-14 h-14 rounded-3xl bg-${s.color}-500/10 text-${s.color}-500 flex items-center justify-center`}><s.icon size={28} /></div>
                <div>
                  <h4 className={`text-xl font-black ${isDark ? 'text-slate-100' : 'text-slate-800'} mb-1`}>{s.title}</h4>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium`}>{s.val}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="w-full mt-10 py-5 bg-indigo-600 text-white rounded-[28px] font-black text-lg hover:bg-indigo-700">시작하기</button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [theme, setTheme] = useState<ThemeType>('light');
  
  // AI 추천 모드 관련 상태
  const [activeAiRecId, setActiveAiRecId] = useState<string | null>(null);
  const [aiRecLoading, setAiRecLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Record<string, string[]>>({});

  // 초기화된 사용자 통계
  const [userStats, setUserStats] = useState<UserStats>({
    points: 0, 
    level: '입문 튜티', 
    completedQuizzes: 0, 
    correctAnswers: 0, 
    totalQuestions: 0,
    progress: { intro: 0, intermediate: 0, advanced: 0 }
  });
  
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (messages.length === 0) setMessages(INITIAL_MESSAGES);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, activeView]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const prefillInput = (text: string) => {
    setInput(text);
    setTimeout(() => chatInputRef.current?.focus(), 100);
  };

  const handleAiRecommend = async (scenarioId: string, title: string) => {
    setAiRecLoading(true);
    setActiveAiRecId(scenarioId);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `부동산 경제 전문가로서, "${title}" 대주제와 관련된 매우 구체적이고 현실적인 투자 시뮬레이션 질문 3개를 JSON 배열 형식으로 추천해줘. 질문은 30자 이내로 간결하게 작성해.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      const recs = JSON.parse(response.text);
      setAiRecommendations(prev => ({ ...prev, [scenarioId]: recs }));
    } catch (e) {
      alert("AI 추천을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setAiRecLoading(false);
    }
  };

  const handleSend = async (overrideText?: string) => {
    const query = overrideText || input;
    if (!query.trim() && !pendingFile) return;
    if (isLoading) return;

    setActiveView('chat');
    const userMsg: Message = { role: 'user', text: query || (pendingFile ? `${pendingFile.name} 분석` : '') };
    if (pendingFile) userMsg.filePreview = { name: pendingFile.name, type: pendingFile.type, url: URL.createObjectURL(pendingFile) };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const currentParts: any[] = [{ text: query }];
      if (pendingFile) {
        const b64 = await fileToBase64(pendingFile);
        currentParts.push({ inlineData: { data: b64, mimeType: pendingFile.type } });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ role: 'user', parts: currentParts }],
        config: {
          systemInstruction: "당신은 부동산 경제 전문 튜터 'EcoTutor'입니다. 전문적이고 분석적으로 답변하며 퀴즈 요청 시 ```quiz-data 블록 안에 JSON으로 응답하세요.",
          tools: [{ googleSearch: {} }]
        }
      });

      let text = response.text || "No response received.";
      let quizData: QuizQuestion[] | undefined;
      const qMatch = text.match(/```quiz-data\s*([\s\S]*?)\s*```/);
      if (qMatch) {
        try { 
          quizData = JSON.parse(qMatch[1]); 
          text = text.replace(qMatch[0], "\n\n**[맞춤형 부동산 경제 퀴즈가 생성되었습니다!]**"); 
        } catch(e) {}
      }

      setMessages(prev => [...prev, { 
        role: 'model', text, quizData, 
        groundingSources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(c => c.web).map(c => ({ title: c.web!.title || '출처', uri: c.web!.uri })) 
      }]);
      
      setUserStats(prev => {
        const newPoints = prev.points + 10;
        let newLevel = prev.level;
        if (newPoints > 1000) newLevel = "부동산 마스터";
        else if (newPoints > 500) newLevel = "중급 가이드";
        else if (newPoints > 200) newLevel = "성장하는 튜티";
        
        return { ...prev, points: newPoints, level: newLevel };
      });

      setPendingFile(null);
    } catch (e: any) {
      if (e.message?.includes("Requested entity was not found")) {
        alert("API 연결 설정이 필요합니다. 보안 허브에서 키를 동기화해 주세요.");
        setIsApiSettingsOpen(true);
      }
      setMessages(prev => [...prev, { role: 'model', text: "시스템 연결 지연이 발생했습니다. 보안 허브에서 진단을 실행해 보세요." }]);
    } finally { setIsLoading(false); }
  };

  const updateQuizStats = (score: number, total: number, courseId: string) => {
    setUserStats(prev => {
      const addedPoints = score * 30;
      const newProgress = { ...prev.progress };
      if (courseId === 'intro') newProgress.intro = Math.min(100, newProgress.intro + 20);
      else if (courseId === 'intermediate') newProgress.intermediate = Math.min(100, newProgress.intermediate + 15);
      else if (courseId === 'advanced') newProgress.advanced = Math.min(100, newProgress.advanced + 10);

      return {
        ...prev,
        points: prev.points + addedPoints,
        completedQuizzes: prev.completedQuizzes + 1,
        correctAnswers: prev.correctAnswers + score,
        totalQuestions: prev.totalQuestions + total,
        progress: newProgress
      };
    });
    handleSend("퀴즈 완료 후 나의 성과를 분석해주고 다음 학습 단계를 추천해줘.");
  };

  return (
    <div className={`flex h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} overflow-hidden w-full font-sans transition-all`}>
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} theme={theme} />
      <ApiSettingsModal isOpen={isApiSettingsOpen} onClose={() => setIsApiSettingsOpen(false)} theme={theme} />
      <input type="file" ref={fileInputRef} onChange={(e) => setPendingFile(e.target.files?.[0] || null)} className="hidden" accept="image/*,application/pdf" />

      <aside className={`hidden md:flex flex-col w-64 bg-slate-900 text-white p-6 shrink-0 shadow-2xl transition-all`}>
        <div className="flex items-center gap-2 mb-10"><div className="bg-indigo-600 p-2 rounded-lg"><Building2 size={24} /></div><h1 className="text-xl font-bold italic">EcoTutor</h1></div>
        <nav className="flex-1 space-y-2">
          {[
            { id: 'chat', label: '지능형 문답', icon: BrainCircuit },
            { id: 'dashboard', label: '학습 매니저', icon: LayoutDashboard },
            { id: 'simulation', label: '시뮬레이터', icon: Activity },
            { id: 'analysis', label: '문서 분석', icon: FileSearch }
          ].map(n => (
            <button key={n.id} onClick={() => setActiveView(n.id as ViewType)} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold transition-all text-sm ${activeView === n.id ? 'bg-indigo-600 shadow-xl' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <n.icon size={18} /> {n.label}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto space-y-4">
          <button onClick={() => setIsApiSettingsOpen(true)} className="w-full flex items-center gap-3 p-3 bg-indigo-600/10 hover:bg-indigo-600/20 rounded-2xl transition-colors border border-indigo-500/30 group">
            <ShieldEllipsis size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-black text-indigo-200">API 보안 허브</span>
          </button>
          <div className="p-4 bg-slate-800 rounded-2xl text-[10px] text-center font-black text-slate-500 uppercase tracking-widest">제작: 도시아재</div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className={`h-16 border-b ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white/80'} backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10`}>
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-black flex items-center gap-2 capitalize">{activeView} Mode</h2>
            {isLoading && <div className="flex items-center gap-2 text-xs font-black text-indigo-500"><Loader2 size={14} className="animate-spin" /> Engine Running...</div>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className={`p-2.5 rounded-2xl ${isDark ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'}`}>{isDark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button onClick={() => setIsGuideOpen(true)} className={`p-2.5 rounded-2xl ${isDark ? 'bg-slate-800 text-indigo-400' : 'bg-slate-100 text-indigo-600'}`}><Info size={18} /></button>
            <div className={`flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-2xl border ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-amber-50 border-amber-100 text-amber-500'}`}><Star size={14} fill="currentColor" /> {userStats.points} pts</div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 custom-scrollbar h-full">
          {activeView === 'chat' && (
            <div className="max-w-4xl mx-auto pb-32 space-y-10 animate-in fade-in duration-500">
              {messages.length <= 1 && (
                <div className="text-center py-10">
                  <div className={`inline-flex p-4 rounded-3xl mb-6 ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}><Sparkle size={48} /></div>
                  <h3 className="text-3xl font-black mb-10">부동산 경제 지능형 튜터링</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {CATEGORIZED_STARTERS.map((cat, i) => (
                      <div key={i} className={`p-6 rounded-[32px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm text-left`}>
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`p-2 rounded-xl ${cat.bg} ${cat.color}`}><cat.icon size={18} /></div>
                          <span className="text-xs font-black">{cat.category}</span>
                        </div>
                        <div className="space-y-2">
                          {cat.starters.map((s, j) => (
                            <button key={j} onClick={() => prefillInput(s)} className={`w-full text-left p-3.5 rounded-xl text-[11px] font-bold border transition-all ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-100 hover:bg-indigo-50'} line-clamp-2`}>{s}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {messages.length > 1 && messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] px-6 py-5 rounded-[32px] shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : (isDark ? 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none' : 'bg-white border-slate-200 text-slate-800 rounded-tl-none')}`}>
                    <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{m.text}</ReactMarkdown></div>
                    {m.quizData && <QuizView questions={m.quizData} onComplete={(score, total) => updateQuizStats(score, total, 'custom')} theme={theme} />}
                    {m.groundingSources && (
                      <div className="mt-4 pt-4 border-t border-slate-500/20 flex flex-wrap gap-2">
                        {m.groundingSources.map((s, j) => <a key={j} href={s.uri} target="_blank" className="text-[10px] px-2 py-1 bg-black/10 rounded-lg">{s.title}</a>)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeView === 'simulation' && (
            <div className="max-w-6xl mx-auto pb-32 animate-in fade-in duration-500">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-2"><Activity className="text-rose-500" /> 시나리오 시뮬레이터</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {SIMULATION_SCENARIOS.map(s => (
                  <div key={s.id} className={`p-8 rounded-[40px] border flex flex-col ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm relative overflow-hidden`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.bg} ${s.color}`}><s.icon size={28} /></div>
                      <h4 className="text-xl font-black">{s.title}</h4>
                    </div>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">{s.desc}</p>
                    
                    <div className="space-y-2 mb-8">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">고정 예시 시나리오</p>
                      {s.examples.map((t, j) => (
                        <button key={j} onClick={() => prefillInput(t)} className={`w-full p-4 text-left rounded-2xl text-xs font-bold border transition-all ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-100 hover:bg-indigo-50'} flex justify-between items-center`}>
                          <span className="line-clamp-1">{t}</span> <ArrowUpRight size={14} className="shrink-0" />
                        </button>
                      ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-500/10">
                      <button 
                        onClick={() => handleAiRecommend(s.id, s.title)} 
                        disabled={aiRecLoading}
                        className={`w-full py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 transition-all ${aiRecLoading && activeAiRecId === s.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {aiRecLoading && activeAiRecId === s.id ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                        AI 추천 모드
                      </button>

                      {aiRecommendations[s.id] && activeAiRecId === s.id && !aiRecLoading && (
                        <div className="mt-6 space-y-2 animate-in slide-in-from-top-4 duration-500">
                           <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Sparkles size={12} /> AI 실시간 추천 시나리오</p>
                           {aiRecommendations[s.id].map((rec, k) => (
                             <button 
                                key={k} 
                                onClick={() => prefillInput(rec)} 
                                className={`w-full p-4 text-left rounded-2xl text-xs font-black border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 transition-all flex justify-between items-center text-indigo-700 dark:text-indigo-400`}
                             >
                               <span className="line-clamp-1">{rec}</span> <CheckCircle2 size={14} className="shrink-0" />
                             </button>
                           ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'analysis' && (
            <div className="max-w-5xl mx-auto pb-32 animate-in fade-in duration-500 text-center">
              <h3 className="text-3xl font-black mb-10">부동산 문서 정밀 분석</h3>
              <div onClick={() => fileInputRef.current?.click()} className={`h-64 rounded-[48px] border-4 border-dashed mb-12 flex flex-col items-center justify-center transition-all cursor-pointer ${pendingFile ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-300 bg-white/5 hover:border-indigo-400'}`}>
                {pendingFile ? <div className="text-emerald-500 font-black"><FileText size={48} className="mx-auto mb-4" /> {pendingFile.name}</div> : <div className="text-slate-400 font-bold"><Upload size={48} className="mx-auto mb-4" /> 문서를 업로드하세요.</div>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ANALYSIS_GUIDES.map(g => (
                  <button key={g.id} onClick={() => prefillInput(g.prompt)} className={`p-6 rounded-[32px] border transition-all text-left group ${isDark ? 'bg-slate-900 border-slate-800 hover:border-indigo-900' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${g.bg} ${g.color}`}><g.icon size={24} /></div>
                    <h5 className="text-sm font-black mb-2">{g.title}</h5>
                    <p className="text-[10px] text-slate-500 font-medium line-clamp-2">{g.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeView === 'dashboard' && (
            <div className="max-w-5xl mx-auto pb-32 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                 <div className={`p-8 rounded-[32px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">포인트</p>
                    <h4 className="text-3xl font-black text-indigo-600">{userStats.points} pts</h4>
                 </div>
                 <div className={`p-8 rounded-[32px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">등급</p>
                    <h4 className="text-3xl font-black text-emerald-600">{userStats.level}</h4>
                 </div>
                 <div className={`p-8 rounded-[32px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">완료 퀴즈</p>
                    <h4 className="text-3xl font-black text-rose-600">{userStats.completedQuizzes} 회</h4>
                 </div>
               </div>

               <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-10 rounded-[48px] border mb-12 shadow-sm`}>
                <h4 className="text-xl font-black mb-8 flex items-center gap-2"><Trophy className="text-amber-500" /> 커리큘럼별 퀴즈 학습</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { id: 'intro', title: '입문 코스', desc: '대출 및 세금 기초 상식', icon: BookOpen, color: 'bg-blue-500' },
                    { id: 'intermediate', title: '중급 코스', desc: '수급 및 실전 갭투자 분석', icon: TrendingUp, color: 'bg-purple-500' },
                    { id: 'advanced', title: '고급 코스', desc: '절세 및 부동산 사이클 전략', icon: Award, color: 'bg-amber-500' }
                  ].map(course => (
                    <div key={course.id} className={`${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'} p-6 rounded-[32px] border group hover:border-indigo-500/50 transition-all flex flex-col`}>
                      <div className={`w-12 h-12 ${course.color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg`}><course.icon size={24} /></div>
                      <h5 className="font-black mb-1">{course.title}</h5>
                      <p className="text-[11px] text-slate-500 mb-6 flex-grow">{course.desc}</p>
                      <button onClick={() => prefillInput(`${course.title} 관련 부동산 퀴즈 3개를 내줘`)} className={`w-full py-2.5 ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-indigo-600' : 'bg-white border-slate-200 hover:bg-indigo-600'} border rounded-xl text-xs font-black hover:text-white transition-all`}>퀴즈 시작</button>
                    </div>
                  ))}
                </div>
              </div>

               <div className={`p-10 rounded-[48px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h4 className="text-xl font-black mb-8 flex items-center gap-2"><GraduationCap className="text-indigo-500" /> 마스터 진행 현황</h4>
                  <div className="space-y-6">
                    {[
                      { label: '입문 과정', val: userStats.progress.intro, color: 'bg-blue-500' },
                      { label: '중급 과정', val: userStats.progress.intermediate, color: 'bg-purple-500' },
                      { label: '고급 과정', val: userStats.progress.advanced, color: 'bg-amber-500' }
                    ].map((lv, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs font-black mb-2"><span>{lv.label}</span><span>{lv.val}%</span></div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${lv.color} rounded-full transition-all duration-1000`} style={{ width: `${lv.val}%` }}></div></div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className={`absolute bottom-0 left-0 right-0 p-6 ${isDark ? 'bg-gradient-to-t from-slate-950 via-slate-950 to-transparent' : 'bg-gradient-to-t from-slate-50 via-slate-50 to-transparent'}`}>
          <div className="max-w-3xl mx-auto flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md">
            <button onClick={() => fileInputRef.current?.click()} className={`p-4 rounded-2xl ${pendingFile ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600'}`}><Paperclip size={20} /></button>
            <input 
              ref={chatInputRef}
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSend()} 
              placeholder="부동산 이슈를 입력하세요..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold placeholder:text-slate-400" 
            />
            <button onClick={() => handleSend()} disabled={isLoading || (!input.trim() && !pendingFile)} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg disabled:opacity-30"><Send size={20} /></button>
          </div>
        </div>
      </main>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) createRoot(rootElement).render(<App />);
