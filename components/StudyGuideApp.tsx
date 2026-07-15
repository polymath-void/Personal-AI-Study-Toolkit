"use strict";

import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  Sparkles, 
  HelpCircle, 
  Send, 
  Trash2, 
  Plus, 
  Search, 
  Lightbulb, 
  ChevronRight, 
  ChevronDown,
  CheckCircle2, 
  HelpCircle as QuestionIcon,
  RotateCw,
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
  Volume2,
  VolumeX,
  Bookmark,
  Pin,
  PinOff,
  Share2,
  Play,
  Pause,
  RotateCcw,
  Tag,
  Award,
  Clock,
  Sliders,
  Calendar,
  TrendingUp,
  AlertCircle,
  ThumbsUp,
  BarChart2,
  Flame,
  Printer,
  Headphones,
  Music,
  Volume1,
  Mic,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import GeminiAssistant from "./GeminiAssistant";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";

// Interface definitions
interface VocabularyItem {
  term: string;
  simpleDefinition: string;
}

interface DetailNode {
  name: string;
  description: string;
}

interface CategoryNode {
  name: string;
  description: string;
  children?: DetailNode[];
}

interface MindMapRoot {
  name: string;
  description: string;
  children?: CategoryNode[];
}

interface Flashcard {
  question: string;
  answer: string;
}

interface StudyGuide {
  id: string;
  topicName: string;
  simplifiedConcept: string;
  analogy: string;
  chapterDetails?: {
    fullText: string;
    briefSummary: string;
    contextAndFunFacts: string;
  };
  vocabulary: VocabularyItem[];
  mindmap: MindMapRoot;
  flashcards: Flashcard[];
  createdAt: string;
  tags?: string[];
  studySeconds?: number;
  cardsMasteredCount?: number;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

// Highly polished initial default study guide
const DEFAULT_STUDY_GUIDE: StudyGuide = {
  id: "default-photosynthesis",
  topicName: "Photosynthesis (Study Kit Edition)",
  simplifiedConcept: "Think of photosynthesis as a tiny solar-powered baking kitchen inside plant cells. Instead of baking flour and sugar, this kitchen takes in sunlight energy, water from roots, and carbon dioxide from the air to bake delicious sugar molecules (glucose) that the plant eats to grow. The beautiful byproduct? The kitchen expels oxygen as exhaust waste, which is the exact gas that keeps all animal life breathing!",
  analogy: "A leaf is like an ultra-modern, solar-roofed bakery. The chloroplasts are the kitchens, the chlorophyll pigments are the high-efficiency solar panels capturing sunlight photons, water absorbed by roots is the wet baking batter, and carbon dioxide from the air is the raw flour. The baked cakes are glucose, and oxygen is the packaging waste discharged out of the bakery's double-door air vents (stomata).",
  chapterDetails: {
    fullText: "Photosynthesis is the magical way plants cook their own food! Imagine a plant leaf as a tiny, solar-powered kitchen inside plant cells. In this kitchen, instead of baking with flour and sugar, the plant cooks with water from the soil, carbon dioxide from the air, and energy from the bright sun. The plant uses chlorophyll—which act like tiny green solar panels—to trap the warm sunlight. This solar power splits water molecules into hydrogen and oxygen. The plant keeps the hydrogen to mix with carbon dioxide to bake a sweet sugar cake called glucose, which it eats to grow big and strong. But it doesn't need the oxygen! So, the leaf releases oxygen out into the air as 'packaging waste' through tiny mouth-like vents called stomata. This is the very same oxygen that you, me, and all animals breathe every single second to stay alive! Isn't that an amazing magical circle?",
    briefSummary: "- Plants use sunlight, water, and carbon dioxide to bake glucose (sugar cake).\n- Chlorophyll acts like green solar panels to capture light waves.\n- Water from roots is split apart, releasing fresh oxygen into the air.\n- Stomata are tiny gates on leaves that let bad air in and good breathing air out.\n- Glucose gives plants energy to grow big, while oxygen keeps humans and animals breathing!",
    contextAndFunFacts: "Long ago, in the 1770s, a scientist named Jan Ingenhousz discovered that plants only release oxygen when they are placed in sunlight! Before this, nobody knew why plants were so important for our air. Also, did you know that without plants doing photosynthesis, there would be no food or breathable air for any creatures on Earth? Plants are the ultimate chefs of the planet!"
  },
  vocabulary: [
    {
      term: "Chloroplast",
      simpleDefinition: "The specialized kitchen rooms inside a plant cell where all the solar baking takes place."
    },
    {
      term: "Chlorophyll",
      simpleDefinition: "The brilliant green pigment that acts as solar panels, catching red and blue light waves while reflecting green light."
    },
    {
      term: "Stomata",
      simpleDefinition: "Microscopic mouth-like valve gates on the underside of leaves that let Carbon Dioxide enter and Oxygen exit."
    },
    {
      term: "Thylakoid",
      simpleDefinition: "Stacked pancake-shaped membranes inside chloroplasts where solar cells are physically mounted and light energy is captured."
    }
  ],
  mindmap: {
    name: "Photosynthesis",
    description: "The solar-powered sugar-baking engine of terrestrial life.",
    children: [
      {
        name: "Light Reactions (The Day Shift)",
        description: " Sunlight is harvested in the thylakoid pancake stacks to split water molecules and charge chemical batteries.",
        children: [
          {
            name: "Sunlight Capture",
            description: "Chlorophyll absorbs photons, sending electrons into an excited, high-energy state."
          },
          {
            name: "Water Splitting",
            description: "H2O is ripped apart, releasing hydrogen ions to charge batteries and emitting O2 as exhaust."
          }
        ]
      },
      {
        name: "Calvin Cycle (The Night Shift)",
        description: "The chemical batteries (ATP & NADPH) are utilized in the stroma fluid to construct actual sugar molecules.",
        children: [
          {
            name: "Carbon Fixation",
            description: "Carbon dioxide gas is captured from the air and physically bound into solid organic forms."
          },
          {
            name: "Glucose Synthesis",
            description: "The cell bonds the fixed carbons with hydrogen to bake actual high-energy glucose sugar."
          }
        ]
      }
    ]
  },
  flashcards: [
    {
      question: "What are the three main reactants (starting ingredients) plants require for photosynthesis?",
      answer: "Sunlight (for energy), Water (absorbed via roots), and Carbon Dioxide (absorbed from the ambient air)."
    },
    {
      question: "Which organelle serves as the physical 'kitchen' for photosynthesis?",
      answer: "The Chloroplast, a green-colored organelle that contains stacks of thylakoid membranes."
    },
    {
      question: "What happens during the 'Day Shift' (Light-Dependent Reactions) of photosynthesis?",
      answer: "Chlorophyll captures light, splits water to get electrons, releases oxygen gas, and charges up tiny chemical batteries (ATP/NADPH)."
    },
    {
      question: "Why is the Calvin Cycle called 'Light-Independent' or 'The Night Shift'?",
      answer: "It does not require direct sunlight to run; instead, it uses the chemical batteries charged up earlier to assemble sugar molecules."
    }
  ],
  createdAt: "July 2026",
  tags: ["Biology", "Photosynthesis", "Sciences"],
  studySeconds: 150,
  cardsMasteredCount: 2
};

// Highly polished initial default study guide in Bengali
const DEFAULT_STUDY_GUIDE_BN: StudyGuide = {
  id: "default-photosynthesis-bn",
  topicName: "সালোকসংশ্লেষণ 🌿 (সহজ ভাষায়)",
  simplifiedConcept: "সালোকসংশ্লেষণকে গাছের পাতার ভেতরের একটি ছোট সৌর-চালিত রান্নাঘর হিসেবে কল্পনা করো! গাছেরা মাটি থেকে মূলের সাহায্যে জল নেয়, বাতাস থেকে কার্বন ডাই অক্সাইড নেয়, আর সূর্যের আলো থেকে শক্তি নিয়ে তাদের এই রান্নাঘরে সুস্বাদু চিনি (গ্লুকোজ) তৈরি করে। এই রান্না করার পর পাতা থেকে অক্সিজেন গ্যাস বাতাসে উড়ে যায়, যা আমাদের শ্বাস নিতে সাহায্য করে! 🌿✨",
  analogy: "একটি সবুজ পাতা হলো একটি আধুনিক সোলার-ছাদওয়ালা কেকের দোকান! পাতার রান্নাঘর হলো ক্লোরোপ্লাস্ট, আর ক্লোরোফিল হলো সৌর প্যানেল যা সূর্যের আলো ধরে রাখে। শিকড় দিয়ে আসা জল হলো কেক বানানোর জল, আর বাতাস থেকে আসা কার্বন ডাই অক্সাইড হলো ময়দা। তৈরি হওয়া মিষ্টি গ্লুকোজ কেক গাছ নিজেই খায়, আর অক্সিজেন হলো ফেলে দেওয়া প্যাকেট যা পাতা তার ছোট ছোট ফুটো (স্টোমাটা) দিয়ে বাইরে বের করে দেয়! 🐻🥞",
  chapterDetails: {
    fullText: "সালোকসংশ্লেষণ হলো এমন একটি জাদুকরী প্রক্রিয়া যার মাধ্যমে গাছপালা নিজেদের খাবার নিজেরাই রান্না করে! পাতার কোষে কোষে রয়েছে ছোট্ট সব সৌর-চালিত রান্নাঘর, যাদের ক্লোরোপ্লাস্ট বলা হয়। এই রান্নাঘরে সাধারণ কেক বানানোর ময়দা বা চিনির বদলে ব্যবহার করা হয় শিকড় দিয়ে মাটি থেকে শুষে নেওয়া জল এবং বাতাস থেকে নেওয়া কার্বন ডাই অক্সাইড গ্যাস। পাতার সবুজ কণা বা ক্লোরোফিলগুলো সোলার প্যানেলের মতো কাজ করে সূর্যের আলো বন্দি করে ফেলে। এই সৌরশক্তি দিয়ে জলকে ভেঙে ফেলা হয় এবং চার্জ করা হয় জাদুকরী কেমিক্যাল ব্যাটারি। এরপর গাছ বাতাস থেকে কার্বন ডাই অক্সাইড নিয়ে নিজের জন্য তৈরি করে মিষ্টি গ্লুকোজ চিনি (কেক), যা খেয়ে গাছটি তরতাজা হয়ে বেড়ে ওঠে। কিন্তু রান্না শেষে যে অক্সিজেন গ্যাসটি অবশিষ্ট থাকে, তা গাছের প্রয়োজন হয় না। তাই গাছ তার পাতার নিচের ছোট ফুটো বা স্টোমাটা দিয়ে অক্সিজেন বাতাসে ছেড়ে দেয়। এই অক্সিজেনই আমরা এবং সমস্ত পশুপাখি শ্বাস নেওয়ার সময় গ্রহণ করি! গাছপালা না থাকলে পৃথিবীতে কোনো খাবার বা নিঃশ্বাস নেওয়ার বাতাস থাকত না!",
    briefSummary: "- গাছ সূর্যের আলো, জল ও কার্বন ডাই অক্সাইড ব্যবহার করে মিষ্টি গ্লুকোজ খাবার রান্না করে।\n- ক্লোরোফিল সোলার প্যানেলের মতো কাজ করে সূর্যের আলো শুষে নেয়।\n- দিনের বেলা জল ভেঙে বাতাসে অক্সিজেন গ্যাস ছেড়ে দেওয়া হয়।\n- পাতার নিচে থাকা স্টোমাটা হলো বাতাস যাতায়াতের জাদুকরী দরজা।\n- এই প্রক্রিয়ায় তৈরি গ্লুকোজ গাছকে বড় করে আর অক্সিজেন আমাদের শ্বাস নিতে সাহায্য করে!",
    contextAndFunFacts: "১৭৭০-এর দশকে বিজ্ঞানী জ্যান ইনগেনহাউজ প্রথম আবিষ্কার করেন যে গাছ কেবল সূর্যের আলোর উপস্থিতিতেই বাতাস পরিষ্কার করে এবং অক্সিজেন তৈরি করে! তার আগে মানুষ ভাবত গাছ মাটি থেকে সব খাবার পায়। আরেকটি মজার তথ্য: পৃথিবীর সব কয়লা ও তেল আসলে কোটি বছর আগে সালোকসংশ্লেষণ করা উদ্ভিদের দেহাবশেষ থেকেই তৈরি হয়েছে!"
  },
  vocabulary: [
    {
      term: "ক্লোরোপ্লাস্ট (Chloroplast)",
      simpleDefinition: "গাছের পাতার ভেতরের ছোট ছোট রান্নার ঘর যেখানে সোলার কুকার দিয়ে খাবার রান্না করা হয়।"
    },
    {
      term: "ক্লোরোফিল (Chlorophyll)",
      simpleDefinition: "পাতার সবুজ রঙের জাদুকরী কণা যা সোলার প্যানেলের মতো সূর্যের আলো ধরে রাখতে সাহায্য করে।"
    },
    {
      term: "স্টোমাটা (Stomata)",
      simpleDefinition: "পাতার নিচে থাকা ছোট ছোট মুখের মতো ফুটো, যা দিয়ে বাতাস ভেতরে ঢুকে আর অক্সিজেন বাইরে বের হয়।"
    },
    {
      term: "থাইলাকয়েড (Thylakoid)",
      simpleDefinition: "ক্লোরোপ্লাস্টের ভেতরে স্তূপ করে রাখা ছোট ছোট প্যানকেকের মতো অংশ যেখানে সূর্যালোক বন্দি করা হয়।"
    }
  ],
  mindmap: {
    name: "সালোকসংশ্লেষণ",
    description: "সূর্যের আলো ব্যবহার করে গাছের সুস্বাদু খাবার বানানোর ম্যাজিক ইঞ্জিন!",
    children: [
      {
        name: "দিনের শিফট (Light Reactions)",
        description: "সূর্যের আলো ধরে রেখে জল ভেঙে ফেলা হয় এবং ছোট ছোট জাদুকরী কেমিক্যাল ব্যাটারি চার্জ করা হয়।",
        children: [
          {
            name: "আলো বন্দি করা",
            description: "ক্লোরোফিল কণাগুলো সূর্যের আলো ধরে নিজেদের সতেজ ও শক্তিশালী করে তোলে।"
          },
          {
            name: "জল ভেঙে ফেলা",
            description: "জলকে ভেঙে অক্সিজেন বাতাসে ছেড়ে দেওয়া হয় এবং হাইড্রোজেন দিয়ে ব্যাটারি চার্জ করা হয়।"
          }
        ]
      },
      {
        name: "রাতের শিফট (Calvin Cycle)",
        description: "দিনের বেলা চার্জ করা ব্যাটারি ব্যবহার করে বাতাস থেকে নেওয়া কার্বন ডাই অক্সাইড মিশিয়ে আসল মিষ্টি চিনি তৈরি করা হয়।",
        children: [
          {
            name: "কার্বন বন্দি করা",
            description: "বাতাস থেকে আসা কার্বন ডাই অক্সাইড গ্যাসকে পাতায় আটকে রাখা হয়।"
          },
          {
            name: "গ্লুকোজ মিষ্টি তৈরি",
            description: "গাছ নিজের জন্য শক্তি জোগাতে সুস্বাদু মিষ্টি চিনি (গ্লুকোজ) তৈরি করে।"
          }
        ]
      }
    ]
  },
  flashcards: [
    {
      question: "গাছপালা খাবার তৈরি করতে কোন ৩টি জাদুকরী জিনিস ব্যবহার করে? 🌿",
      answer: "সূর্যের আলো (শক্তির জন্য), জল (মাটি থেকে শুষে নেয়), এবং কার্বন ডাই অক্সাইড (বাতাস থেকে নেয়)।"
    },
    {
      question: "সালোকসংশ্লেষণ প্রক্রিয়াটি পাতার কোন সবুজ 'রান্নাঘরে' ঘটে? 🍳",
      answer: "ক্লোরোপ্লাস্ট (Chloroplast) নামের একটি বিশেষ সবুজ অংশে ঘটে।"
    },
    {
      question: "'দিনের শিফট'-এ গাছপালা জল ভেঙে কোন গ্যাস বাতাসে ছেড়ে দেয়? 💨",
      answer: "অক্সিজেন গ্যাস (যা আমাদের বেঁচে থাকার জন্য সবচেয়ে জরুরি শ্বাস-প্রশ্বাস যোগায়)।"
    },
    {
      question: "সালোকসংশ্লেষণ শেষে গাছ নিজের শরীরে কী সুস্বাদু খাবার তৈরি করে? 🥞",
      answer: "মিষ্টি গ্লুকোজ চিনি (Glucose) তৈরি করে, যা গাছকে বড় হতে শক্তি দেয়।"
    }
  ],
  createdAt: "জুলাই ২০২৬",
  tags: ["বিজ্ঞান", "গাছপালা", "সালোকসংশ্লেষণ"],
  studySeconds: 150,
  cardsMasteredCount: 2
};

const DICTIONARY = {
  en: {
    appName: "Kids Study Kit 🐻✨",
    subtitle: "Smart Parenting- Kids Study Kit- AI wrapped",
    engineTitle: "Smart Kids Study Engine",
    searchPlaceholder: "Search guides by title, tags...",
    all: "All",
    createGuide: "Create New Guide 🚀",
    topicLabel: "What topic are you studying?",
    topicPlaceholder: "e.g. How plants make food, How magnets work...",
    extraNotesLabel: "Add notes or textbook text (Optional)",
    extraNotesPlaceholder: "Paste textbook chapter, raw lecture transcript, or Wikipedia paragraphs...",
    generateBtn: "Deconstruct Complex Matter",
    generatingBtn: "Synthesizing Guide...",
    feynmanDeconstruction: "Simplified Story 🐻",
    mindmap: "Visual Mind Map 🗺️",
    flashcards: "Playful Riddle Cards 🃏",
    clarifier: "Ask Study Buddy 💬",
    dashboard: "My Star Progress 🏆",
    voiceChat: "Voice Chat 🎙️",
    voicesettings: "Speech Buddy Settings 🗣️",
    playbacksymmetric: "Play Speed (Rate)",
    bengalivoice: "Bengali Voice (বাংলা)",
    englishvoice: "English Voice (English)",
    simplifiedEssence: "The Simplified Essence",
    everydayAnalogy: "The Everyday Analogy",
    jargonDemystified: "🔑 Demystifying the Jargon",
    jargonSub: "Click each complex term below to reveal its simple meaning. Hear it read aloud by clicking the speaker icon.",
    flashcardSub: "Practice active recall with fun riddle cards. Can you master them all?",
    clarifierSub: "Have any questions? Ask your friendly Study Buddy and get a simple explanation!",
    dashboardSub: "Real-time stats measuring study play time and riddle card mastery.",
    mastered: "Mastered! 🌟",
    review: "Need Review 🔄",
    totalStudy: "Total Play Study Time",
    cardsMaster: "Riddle Cards Mastered",
    subjectCoverage: "Subject Coverage",
    kidModeActive: "Kid Mode Active (Ages 6-10) 👶",
    demystifyingJargon: "🔑 Demystifying the Jargon",
    demystifyingJargonDesc: "Click each complex term below to reveal its simple explanation. Click speaker to hear it!",
    hideDefinition: "Hide Explanation 🙈",
    revealExplanation: "Reveal Simple Explanation 💎",
    activeRecallPractice: "Pegged Active Recall Practice 🧠",
    activeRecallPracticeDesc: "Trigger chemical memory consolidation. Read, recall, then click to flip the card!",
    cardNumber: "Card",
    resetDeck: "Reset Deck 🔄",
    questionSide: "Question Side ❓",
    flipInstruction: "Click anywhere to flip and see simplified answer",
    answerSide: "Simple Explanation 💡",
    flipBackInstruction: "Click to flip back to question",
    stillReviewing: "Still Reviewing 🔄",
    memorized: "Memorized! ⭐",
    prevCard: "Previous Card",
    nextCard: "Next Card",
    activePedagogyClarifier: "Active Pedagogy Clarifier 💬",
    clearChat: "Clear Chat 🧹",
    tutorDrafting: "Tutor drafting intuitive simplification... ✍️",
    chatPlaceholder: "Type follow-up study question (e.g., 'What is the role of NADPH?')...",
    parentsCorner: "Parents & Premium 👨‍👩‍👧",
    parentsCornerSub: "Set weekly goals, view child playtime stats, and configure motivational star rewards!",
    premiumUpgrade: "Super Kid Premium 👑",
    unlockPremiumText: "Unlock extra cute animal avatar characters, friendly dino/unicorn voice personalities, and print-ready coloring booklets!",
    becomeProBtn: "Unlock Premium Access 🚀"
  },
  bn: {
    appName: "স্মার্ট কিডস স্টাডি কিট 🐻✨",
    subtitle: "স্মার্ট প্যারেন্টিং - কিডস স্টাডি কিট - এআই সহযোগে সহজ ও রঙিন মাইন্ড ম্যাপ",
    engineTitle: "স্মার্ট কিডস স্টাডি ইঞ্জিন",
    searchPlaceholder: "পড়াশোনার টপিক খুঁজুন...",
    all: "সবগুলো",
    createGuide: "নতুন পড়া তৈরি করুন 🚀",
    topicLabel: "তুমি আজকে কী বিষয় পড়তে চাও?",
    topicPlaceholder: "যেমন: গাছ কীভাবে খাবার তৈরি করে, চুম্বক কীভাবে কাজ করে...",
    extraNotesLabel: "বইয়ের লেখা বা নোট যোগ করো (ঐচ্ছিক)",
    extraNotesPlaceholder: "বইয়ের কোনো লেখা বা উইকিপিডিয়ার প্যারাগ্রাফ এখানে পেস্ট করে দাও...",
    generateBtn: "পড়া সহজ করো! ✨",
    generatingBtn: "সহজ করা হচ্ছে...",
    feynmanDeconstruction: "সহজ গল্প 🐻",
    mindmap: "রঙিন মাইন্ড ম্যাপ 🗺️",
    flashcards: "মজার ধাঁধার কার্ড 🃏",
    clarifier: "স্টাডি বাডিকে জিজ্ঞাসা করো 💬",
    dashboard: "আমার তারা ও মেডেল 🏆",
    voiceChat: "ভয়েস চ্যাট 🎙️",
    voicesettings: "কথা বলার সেটিংস 🗣️",
    playbacksymmetric: "কথা বলার গতি (Rate)",
    bengalivoice: "বাংলা কণ্ঠস্বর (বাংলা)",
    englishvoice: "ইংরেজি কণ্ঠস্বর (English)",
    simplifiedEssence: "সহজ ভাষায় মূল বিষয়",
    everydayAnalogy: "রোজকার জীবনের মজার উদাহরণ",
    jargonDemystified: "🔑 কঠিন কঠিন শব্দের সহজ মানে",
    jargonSub: "যেকোনো কঠিন শব্দের ওপর চাপ দিয়ে তার সহজ মানে জেনে নাও! স্পিকার বাটনে চাপ দিয়ে শুনতেও পারো।",
    flashcardSub: "মজার ধাঁধার মাধ্যমে কুইজ খেলো! তুমি কি সবগুলোতে জিততে পারবে?",
    clarifierSub: "পড়া নিয়ে কোনো প্রশ্ন থাকলে নিচে লিখে বাডিকে জিজ্ঞেস করো!",
    dashboardSub: "তোমার পড়ালেখার সময় এবং ধাঁধা কার্ড জেতার পরিসংখ্যান!",
    mastered: "পেরেছি! 🌟",
    review: "আবার দেখব 🔄",
    totalStudy: "মোট পড়ার সময়",
    cardsMaster: "জিতে নেওয়া ধাঁধা",
    subjectCoverage: "মোট বিষয়",
    kidModeActive: "বাচ্চাদের জন্য সহজ মোড সক্রিয় (বয়স ৬-১০) 👶",
    demystifyingJargon: "🔑 কঠিন শব্দের সহজ অর্থ",
    demystifyingJargonDesc: "সহজ অর্থ দেখতে নিচের যেকোনো কঠিন শব্দে ক্লিক করো। শুনতে স্পিকার বাটনে চাপ দাও!",
    hideDefinition: "অর্থ লুকান 🙈",
    revealExplanation: "সহজ অর্থ দেখুন 💎",
    activeRecallPractice: "সক্রিয় পড়া মনে রাখার অভ্যাস 🧠",
    activeRecallPracticeDesc: "মস্তিষ্কের স্মৃতিশক্তি বাড়াও! প্রশ্নটি পড়ো, মনে করার চেষ্টা করো, তারপর কার্ডটি উল্টে উত্তর মেলাও!",
    cardNumber: "কার্ড নং",
    resetDeck: "ডেক রিসেট 🔄",
    questionSide: "প্রশ্ন দিক ❓",
    flipInstruction: "সহজ উত্তর দেখতে কার্ডের যেকোনো জায়গায় ক্লিক করো",
    answerSide: "সহজ সমাধান দিক 💡",
    flipBackInstruction: "আবার প্রশ্ন দেখতে এখানে ক্লিক করো",
    stillReviewing: "আরেকটু পড়তে হবে 🔄",
    memorized: "মুখস্থ হয়েছে! ⭐",
    prevCard: "আগের কার্ড",
    nextCard: "পরের কার্ড",
    activePedagogyClarifier: "সহজ ভাষায় পড়া বোঝানো সহকারী 💬",
    clearChat: "আলাপ মুছুন 🧹",
    tutorDrafting: "তোমার জন্য সহজ উত্তর তৈরি করা হচ্ছে... ✍️",
    chatPlaceholder: "টপিক নিয়ে যেকোনো প্রশ্ন করো (যেমন: 'NADPH কী কাজ করে?')...",
    parentsCorner: "অভিভাবক কর্নার 👨‍👩‍👧",
    parentsCornerSub: "বাচ্চার পড়ার লক্ষ্য ও সুস্বাদু উপহার বা জাদুকরী অনুপ্রেরণা বার্তা সেট করুন!",
    premiumUpgrade: "সুপার কিড প্রিমিয়াম 👑",
    unlockPremiumText: "সব কিউট এনিম্যাল অবতার, ডাইনোসর ও ইউনিকর্ন ক্যারেক্টার ভয়েস এবং আকর্ষণীয় বুকলেট প্রিন্টিং আনলক করুন!",
    becomeProBtn: "স্টার প্রো হোন মাত্র ৪৯৯৳/মাসে 🚀"
  }
};

export default function StudyGuideApp() {
  // Local state management
  const [guides, setGuides] = useState<StudyGuide[]>([]);
  const [activeGuide, setActiveGuide] = useState<StudyGuide | null>(null);
  const [activeTab, setActiveTab] = useState<"feynman" | "mindmap" | "flashcards" | "clarifier" | "dashboard" | "voiceChat" | "parents">("feynman");
  
  // App-wide language operating (English vs Bengali)
  const [appLanguage, setAppLanguage] = useState<"en" | "bn">("en");

  // Topic creation state
  const [newTopic, setNewTopic] = useState("");
  const [extraContext, setExtraContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationError, setGenerationError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Search and Categorization Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState("All");
  const [newTagInput, setNewTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  // Terminology tab state
  const [revealedVocab, setRevealedVocab] = useState<Record<string, boolean>>({});

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [cardStatus, setCardStatus] = useState<Record<number, "correct" | "review" | null>>({});
  const [guidesCardStatus, setGuidesCardStatus] = useState<Record<string, Record<number, "correct" | "review" | null>>>({});

  // Mind map state
  const [selectedNode, setSelectedNode] = useState<{ name: string; description: string } | null>(null);
  const [mindmapZoom, setMindmapZoom] = useState<number>(1);
  const [mindmapPanX, setMindmapPanX] = useState<number>(0);
  const [mindmapPanY, setMindmapPanY] = useState<number>(0);
  const [mindmapActiveRecall, setMindmapActiveRecall] = useState<boolean>(false);
  const [mindmapGuessedNodes, setMindmapGuessedNodes] = useState<Record<string, boolean>>({});
  const [mindmapPulseActive, setMindmapPulseActive] = useState<boolean>(false);

  // Follow-up Clarifier Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Bengali and English Speech Synthesis (TTS) State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenText, setSpokenText] = useState<string | null>(null);
  const [bengaliVoiceEnabled, setBengaliVoiceEnabled] = useState(false);
  const [ttsRate, setTtsRate] = useState(1.0); // Default speed is normal (1.0)

  // Pomodoro Study Timer State
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(25);
  const [timerMode, setTimerMode] = useState<"focus" | "shortBreak" | "longBreak">("focus");

  // Background Ambiance Audio State
  const [ambientSound, setAmbientSound] = useState<"none" | "rainforest" | "library" | "lofi">("none");
  const [ambientVolume, setAmbientVolume] = useState<number>(0.15);
  const [ambientPlaying, setAmbientPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Voice Persona State
  const [voicePersona, setVoicePersona] = useState<"teacher" | "robot" | "kid">("teacher");

  // Voice Chat States
  const [voiceChatHistory, setVoiceChatHistory] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [voiceChatInput, setVoiceChatInput] = useState("");
  const [isVoiceChatting, setIsVoiceChatting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Did You Know Modal States
  const [showDidYouKnow, setShowDidYouKnow] = useState(false);
  const [didYouKnowFact, setDidYouKnowFact] = useState("");
  const [isFetchingFact, setIsFetchingFact] = useState(false);
  const [hasShownFactForCurrentDeck, setHasShownFactForCurrentDeck] = useState(false);


  // Streak & sharing states
  const [streakCount, setStreakCount] = useState(0);
  
  // Kid-friendly and Parent SaaS Customizations
  const [kidAvatar, setKidAvatar] = useState<"bear" | "bunny" | "dino" | "unicorn" | "panda">("bear");
  const [isPremium, setIsPremium] = useState(false);
  const [parentGoalTime, setParentGoalTime] = useState(15); // weekly target in minutes
  const [parentRewardMsg, setParentRewardMsg] = useState("A delicious ice cream! 🍦");
  const [parentNoteToChild, setParentNoteToChild] = useState("");

  // Collapsible UI Sections
  const [isTtsPanelCollapsed, setIsTtsPanelCollapsed] = useState(true);
  const [isSimplifiedConceptCollapsed, setIsSimplifiedConceptCollapsed] = useState(false);
  const [isAnalogyCollapsed, setIsAnalogyCollapsed] = useState(false);
  const [isVocabularyCollapsed, setIsVocabularyCollapsed] = useState(false);
  const [isAchievementsCollapsed, setIsAchievementsCollapsed] = useState(false);
  const [isChartsCollapsed, setIsChartsCollapsed] = useState(false);
  const [isParentSettingsCollapsed, setIsParentSettingsCollapsed] = useState(false);

  // Bookmarks / Pinned guides state
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Universal AI API Configuration states
  const [apiOperator, setApiOperator] = useState<"gemini" | "openai" | "custom">("gemini");
  const [apiModel, setApiModel] = useState<string>("gemini-3.5-flash");
  const [apiCustomUrl, setApiCustomUrl] = useState<string>("");

  const handleSetApiOperator = (op: "gemini" | "openai" | "custom") => {
    setApiOperator(op);
    localStorage.setItem("feynman_api_operator", op);
  };

  const handleSetApiModel = (model: string) => {
    setApiModel(model);
    localStorage.setItem("feynman_api_model", model);
  };

  const handleSetApiCustomUrl = (url: string) => {
    setApiCustomUrl(url);
    localStorage.setItem("feynman_api_custom_url", url);
  };

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setBookmarkedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem("feynman_bookmarked_ids", JSON.stringify(updated));
      console.log("Flexible cloud sync payload placeholder:", { userId: "guest_or_profile_id", bookmarkedIds: updated });
      return updated;
    });
  };

  const getApiConfigForFetch = () => {
    try {
      const savedOperator = localStorage.getItem("feynman_api_operator") || "gemini";
      const savedModel = localStorage.getItem("feynman_api_model") || "gemini-3.5-flash";
      const savedCustomUrl = localStorage.getItem("feynman_api_custom_url") || "";
      return {
        operator: savedOperator,
        model: savedModel,
        customUrl: savedCustomUrl
      };
    } catch (e) {
      return { operator: "gemini", model: "gemini-3.5-flash", customUrl: "" };
    }
  };
  const [chapterSubTab, setChapterSubTab] = useState<"text" | "brief" | "backstory">("text");
  const [focusRulerActive, setFocusRulerActive] = useState(false);
  const [focusRulerPosition, setFocusRulerPosition] = useState<number | null>(null);
  const getMascotEmoji = () => {
    switch (kidAvatar) {
      case "bunny": return "🐰";
      case "dino": return "🦖";
      case "unicorn": return "🦄";
      case "panda": return "🐼";
      default: return "🐻";
    }
  };
  const [lastStudyDate, setLastStudyDate] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleToggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("study_kit_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("study_kit_theme", "light");
    }
  };

  // Translation helper
  const t = DICTIONARY[appLanguage];

  // Load guides on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("study_kit_theme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    const saved = localStorage.getItem("feynman_study_guides");
    const savedCardStatuses = localStorage.getItem("feynman_card_statuses");
    const savedLang = localStorage.getItem("feynman_app_language");
    const savedRate = localStorage.getItem("feynman_tts_rate");
    const savedVoicePersona = localStorage.getItem("feynman_voice_persona");

    let initialLang: "en" | "bn" = "en";
    if (savedLang === "en" || savedLang === "bn") {
      setAppLanguage(savedLang as "en" | "bn");
      initialLang = savedLang as "en" | "bn";
      if (savedLang === "bn") {
        setBengaliVoiceEnabled(true);
      }
    } else {
      setAppLanguage("en");
      initialLang = "en";
    }

    if (savedRate) {
      const parsedRate = parseFloat(savedRate);
      if (!isNaN(parsedRate) && parsedRate >= 0.5 && parsedRate <= 2.0) {
        setTtsRate(parsedRate);
      }
    }

    if (savedVoicePersona === "teacher" || savedVoicePersona === "robot" || savedVoicePersona === "kid") {
      setVoicePersona(savedVoicePersona);
    }
    
    if (savedCardStatuses) {
      try {
        setGuidesCardStatus(JSON.parse(savedCardStatuses));
      } catch (e) {
        console.error("Failed to parse saved card statuses:", e);
      }
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          // Backward compatibility check to ensure all guides have tags/metrics
          const migrated = parsed.map((g: any) => ({
            ...g,
            tags: g.tags || ["General"],
            studySeconds: g.studySeconds || 0,
            cardsMasteredCount: g.cardsMasteredCount || 0
          }));
          setGuides(migrated);
          setActiveGuide(migrated[0]);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved guides:", e);
      }
    }
    // Set default guide if nothing saved (provide both so kid can play with them)
    const initialGuides = [DEFAULT_STUDY_GUIDE_BN, DEFAULT_STUDY_GUIDE];
    setGuides(initialGuides);
    setActiveGuide(initialGuides[0]);

    // Load and validate daily study streak from localStorage
    const savedStreak = localStorage.getItem("feynman_streak_count");
    const savedLastDate = localStorage.getItem("feynman_last_study_date");
    
    const getDaysDiff = (d1Str: string, d2Str: string) => {
      const d1 = new Date(d1Str + "T00:00:00");
      const d2 = new Date(d2Str + "T00:00:00");
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      return Math.round(diffTime / (1000 * 60 * 60 * 24));
    };

    const todayStr = new Date().toLocaleDateString("en-CA");

    if (savedLastDate) {
      setLastStudyDate(savedLastDate);
      const diff = getDaysDiff(savedLastDate, todayStr);
      if (diff > 1 && savedLastDate !== todayStr) {
        setStreakCount(0);
        localStorage.setItem("feynman_streak_count", "0");
      } else if (savedStreak) {
        setStreakCount(parseInt(savedStreak, 10) || 0);
      }
    } else if (savedStreak) {
      setStreakCount(parseInt(savedStreak, 10) || 0);
    }

    // Load bookmarked guide IDs
    const savedBookmarks = localStorage.getItem("feynman_bookmarked_ids");
    if (savedBookmarks) {
      try {
        setBookmarkedIds(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error("Failed to parse saved bookmarks:", e);
      }
    }

    // Load universal AI API Configuration
    const savedOperator = localStorage.getItem("feynman_api_operator");
    const savedModel = localStorage.getItem("feynman_api_model");
    const savedCustomUrl = localStorage.getItem("feynman_api_custom_url");

    if (savedOperator === "gemini" || savedOperator === "openai" || savedOperator === "custom") {
      setApiOperator(savedOperator as any);
    }
    if (savedModel) {
      setApiModel(savedModel);
    }
    if (savedCustomUrl) {
      setApiCustomUrl(savedCustomUrl);
    }
  }, []);

  // Save guides to localStorage on change
  const saveGuides = (updated: StudyGuide[]) => {
    setGuides(updated);
    localStorage.setItem("feynman_study_guides", JSON.stringify(updated));
  };

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatLoading]);

  // Loading animation sequence
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setGenerationStep((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleVoiceChatSubmit = React.useCallback(async (textToSubmit?: string) => {
    const text = typeof textToSubmit === "string" ? textToSubmit : voiceChatInput;
    if (!text.trim()) return;

    const newUserMsg = { role: "user" as const, text };
    setVoiceChatHistory((prev) => [...prev, newUserMsg]);
    setVoiceChatInput("");
    setIsVoiceChatting(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "voiceChat",
          question: text,
          history: voiceChatHistory,
          language: appLanguage,
          apiConfig: getApiConfigForFetch()
        }),
      });
      if (!response.ok) throw new Error("Failed to get voice chat response");
      
      const data = await response.json();
      setVoiceChatHistory((prev) => [...prev, { role: "bot", text: data.text }]);
      speakText(data.text);
    } catch (error) {
      console.error(error);
      setVoiceChatHistory((prev) => [
        ...prev,
        { role: "bot", text: appLanguage === "en" ? "Oops! Something went wrong. Let's try again!" : "উফ! কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করি!" }
      ]);
    } finally {
      setIsVoiceChatting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceChatInput, voiceChatHistory, appLanguage]);

  const handleAssistantMessage = async (message: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          question: message,
          language: appLanguage,
          apiConfig: getApiConfigForFetch()
        }),
      });
      const data = await response.json();
      alert(data.text);
    } catch (e) {
      console.error(e);
      alert("Oops! Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Real-time time study seconds accumulator
  const updateActiveGuideStudyTime = React.useCallback((seconds: number) => {
    if (!activeGuide) return;
    setGuides((prev) => {
      const updated = prev.map((g) => {
        if (g.id === activeGuide.id) {
          return {
            ...g,
            studySeconds: (g.studySeconds || 0) + seconds
          };
        }
        return g;
      });
      localStorage.setItem("feynman_study_guides", JSON.stringify(updated));
      return updated;
    });
    
    setActiveGuide((prev) => {
      if (prev && prev.id === activeGuide.id) {
        return {
          ...prev,
          studySeconds: (prev.studySeconds || 0) + seconds
        };
      }
      return prev;
    });
  }, [activeGuide]);

  // Pomodoro ticking effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerIsRunning) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds((prev) => prev - 1);
          if (timerMode === "focus" && activeGuide) {
            updateActiveGuideStudyTime(1);
          }
        } else if (timerMinutes > 0) {
          setTimerMinutes((prev) => prev - 1);
          setTimerSeconds(59);
          if (timerMode === "focus" && activeGuide) {
            updateActiveGuideStudyTime(1);
          }
        } else {
          setTimerIsRunning(false);
          playAlertChime();
          
          if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "default") {
              Notification.requestPermission();
            } else if (Notification.permission === "granted") {
              try {
                new Notification("Study Block Complete!", {
                  body: timerMode === "focus" 
                    ? "Fantastic focus! Take a well-deserved short break now." 
                    : "Break is over! Ready to return to standard calibration?",
                });
              } catch (err) {
                console.error("Notification failed:", err);
              }
            }
          }
          
          alert(`🎉 ${timerMode === "focus" ? "Focus interval completed! Take a break." : "Break completed! Back to focus."}`);
          
          if (timerMode === "focus") {
            // Update daily study streak
            const todayStr = new Date().toLocaleDateString("en-CA");
            setLastStudyDate((prevLastDate) => {
              setStreakCount((prevStreak) => {
                let newStreak = prevStreak;
                if (!prevLastDate) {
                  newStreak = 1;
                } else if (prevLastDate === todayStr) {
                  newStreak = prevStreak;
                } else {
                  const getDaysDiff = (d1Str: string, d2Str: string) => {
                    const d1 = new Date(d1Str + "T00:00:00");
                    const d2 = new Date(d2Str + "T00:00:00");
                    const diffTime = Math.abs(d2.getTime() - d1.getTime());
                    return Math.round(diffTime / (1000 * 60 * 60 * 24));
                  };
                  const diff = getDaysDiff(prevLastDate, todayStr);
                  if (diff === 1) {
                    newStreak = prevStreak + 1;
                  } else {
                    newStreak = 1;
                  }
                }
                localStorage.setItem("feynman_streak_count", newStreak.toString());
                return newStreak;
              });
              localStorage.setItem("feynman_last_study_date", todayStr);
              return todayStr;
            });

            setTimerMode("shortBreak");
            setTimerMinutes(5);
          } else {
            setTimerMode("focus");
            setTimerMinutes(25);
          }
          setTimerSeconds(0);
        }
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerIsRunning, timerMinutes, timerSeconds, timerMode, activeGuide, updateActiveGuideStudyTime]);

  // Background Ambiance Audio Controller Effect
  useEffect(() => {
    if (typeof window === "undefined") return;

    const getAudioUrl = () => {
      switch (ambientSound) {
        case "rainforest":
          return "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg";
        case "library":
          return "https://actions.google.com/sounds/v1/ambiences/coffee_shop_ambience.ogg";
        case "lofi":
          return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        default:
          return "";
      }
    };

    const url = getAudioUrl();

    if (!url || !ambientPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.loop = true;
    } else {
      if (audioRef.current.src !== url) {
        audioRef.current.pause();
        audioRef.current.src = url;
      }
    }

    audioRef.current.volume = ambientVolume;
    audioRef.current.loop = true;

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log("Audio playback was suspended or failed:", error);
        setAmbientPlaying(false);
      });
    }
  }, [ambientSound, ambientPlaying, ambientVolume]);

  const handleSelectAmbient = (sound: "none" | "rainforest" | "library" | "lofi") => {
    setAmbientSound(sound);
    if (sound === "none") {
      setAmbientPlaying(false);
    } else {
      setAmbientPlaying(true);
    }
  };

  
  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setVoiceChatInput(transcript);
          setIsListening(false);
          // Auto-submit after voice input
          handleVoiceChatSubmit(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [appLanguage, handleVoiceChatSubmit]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = appLanguage === "bn" ? "bn-BD" : "en-US";
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Speech recognition is not supported in your browser.");
      }
    }
  };

  const fetchDidYouKnow = React.useCallback(async () => {
    if (!activeGuide) return;
    setIsFetchingFact(true);
    setShowDidYouKnow(true);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "didYouKnow",
          topic: activeGuide.topicName,
          language: appLanguage,
          apiConfig: getApiConfigForFetch()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDidYouKnowFact(data.text);
        speakText(data.text);
      }
    } catch (e) {
      console.error(e);
      setDidYouKnowFact(appLanguage === "en" ? "Did you know that learning makes your brain grow?" : "তুমি কি জানো যে বিজ্ঞান আমাদের চারপাশেই আছে?");
    } finally {
      setIsFetchingFact(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGuide, appLanguage]);

  useEffect(() => {
    if (activeGuide && activeTab === "flashcards") {
      const totalCardsCount = activeGuide.flashcards?.length || 0;
      const masteredCount = Object.values(cardStatus).filter((s) => s === "correct").length;
      const isAllMastered = totalCardsCount > 0 && masteredCount === totalCardsCount;

      if (isAllMastered && !hasShownFactForCurrentDeck) {
        setHasShownFactForCurrentDeck(true);
        fetchDidYouKnow();
      }
    }
  }, [cardStatus, activeGuide, activeTab, hasShownFactForCurrentDeck, fetchDidYouKnow]);

  // Reset flag when guide changes
  useEffect(() => {
    setHasShownFactForCurrentDeck(false);
    setShowDidYouKnow(false);
    setDidYouKnowFact("");
  }, [activeGuide?.id]);

  // Web Audio Synth Chime
  const playAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      
      gainNode.gain.setValueAtTime(0.35, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      
      osc1.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.start(now);
      osc1.stop(now + 0.6);
    } catch (e) {
      console.error("Web Audio API failed:", e);
    }
  };

  // Text to speech with Bengali support
  function speakText(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    try {
      // Resume and cancel any pending speech to clean up stuck states
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();

      if (isSpeaking && spokenText === text) {
        setIsSpeaking(false);
        setSpokenText(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply chosen voice persona attributes
      if (voicePersona === "robot") {
        utterance.pitch = 0.5; // Deep voice
        utterance.rate = ttsRate * 0.85; // Slightly slower
      } else if (voicePersona === "kid") {
        utterance.pitch = 1.5; // High squeaky kid pitch
        utterance.rate = ttsRate * 1.2; // Faster, higher energy
      } else {
        // "teacher" - Warm friendly educator voice
        utterance.pitch = 1.05; // Slightly warmer/higher pitch
        utterance.rate = ttsRate * 0.95; // Steady, cozy speed
      }
      
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;

      if (bengaliVoiceEnabled) {
        selectedVoice = voices.find(v => v.lang.toLowerCase().includes("bn")) || null;
        utterance.lang = "bn-BD";
      } else {
        selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith("en") && v.name.toLowerCase().includes("google")) ||
                        voices.find(v => v.lang.toLowerCase().startsWith("en")) ||
                        null;
        utterance.lang = "en-US";
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpokenText(text);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpokenText(null);
        if ((window as any)._activeUtterance === utterance) {
          (window as any)._activeUtterance = null;
        }
      };

      utterance.onerror = (event) => {
        console.error("SpeechSynthesis error:", event);
        setIsSpeaking(false);
        setSpokenText(null);
        if ((window as any)._activeUtterance === utterance) {
          (window as any)._activeUtterance = null;
        }
      };

      // Critical chromium workaround: prevent garbage collection of the utterance object
      (window as any)._activeUtterance = utterance;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Error during speech synthesis:", e);
    }
  };

  // Tag manipulation handlers
  const handleAddTag = (newTag: string) => {
    if (!activeGuide || !newTag.trim()) return;
    const cleanTag = newTag.trim();
    const currentTags = activeGuide.tags || [];
    if (currentTags.includes(cleanTag)) return;
    
    const updatedTags = [...currentTags, cleanTag];
    const updated = guides.map((g) => {
      if (g.id === activeGuide.id) {
        return {
          ...g,
          tags: updatedTags
        };
      }
      return g;
    });
    
    saveGuides(updated);
    setActiveGuide((prev) => {
      if (prev && prev.id === activeGuide.id) {
        return {
          ...prev,
          tags: updatedTags
        };
      }
      return prev;
    });
    setNewTagInput("");
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!activeGuide) return;
    const currentTags = activeGuide.tags || [];
    const updatedTags = currentTags.filter((t) => t !== tagToRemove);
    
    const updated = guides.map((g) => {
      if (g.id === activeGuide.id) {
        return {
          ...g,
          tags: updatedTags
        };
      }
      return g;
    });
    
    saveGuides(updated);
    setActiveGuide((prev) => {
      if (prev && prev.id === activeGuide.id) {
        return {
          ...prev,
          tags: updatedTags
        };
      }
      return prev;
    });
  };

  // Reset active guide related states
  useEffect(() => {
    if (activeGuide) {
      setRevealedVocab({});
      setCurrentCardIndex(0);
      setIsCardFlipped(false);
      
      // Stop speaking when switching guides
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setSpokenText(null);
      }

      // Restore card status for this guide from global memory
      const activeGuideCardStatus = guidesCardStatus[activeGuide.id] || {};
      setCardStatus(activeGuideCardStatus);

      setSelectedNode({
        name: activeGuide.mindmap.name,
        description: activeGuide.mindmap.description
      });
      // Initial tutor welcome message
      setChatHistory([
        {
          sender: "ai",
          text: `Welcome! I am your dynamic Kids Study Kit Tutor. I've analyzed **"${activeGuide.topicName}"**.\n\nYou can click on any vocabulary term or mindmap node to understand them, or type any follow-up question below (e.g. *"Explain the Night Shift reaction in detail"* or *"Give me another everyday analogy"*). What can I clear up?`
        }
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGuide]);

  // Launch guide generation
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    setIsGenerating(true);
    setGenerationStep(0);
    setGenerationError("");

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          topic: newTopic,
          context: extraContext,
          language: appLanguage,
          apiConfig: getApiConfigForFetch()
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate study guide.");
      }

      const parsedGuide = await response.json();
      
      const newGuide: StudyGuide = {
        id: `guide-${Date.now()}`,
        topicName: parsedGuide.topicName || newTopic,
        simplifiedConcept: parsedGuide.simplifiedConcept,
        analogy: parsedGuide.analogy,
        chapterDetails: parsedGuide.chapterDetails,
        vocabulary: parsedGuide.vocabulary || [],
        mindmap: parsedGuide.mindmap || { name: newTopic, description: "Main topic deconstruction" },
        flashcards: parsedGuide.flashcards || [],
        createdAt: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        tags: parsedGuide.tags && parsedGuide.tags.length > 0 ? parsedGuide.tags : ["General"],
        studySeconds: 0,
        cardsMasteredCount: 0
      };

      const updatedGuides = [newGuide, ...guides.filter((g) => g.id !== "default-photosynthesis")];
      saveGuides(updatedGuides);
      setActiveGuide(newGuide);
      setNewTopic("");
      setExtraContext("");
      setActiveTab("feynman");
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || "An unexpected error occurred during synthesis.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle follow-up chat submission
  const handleSendChat = async (questionText?: string) => {
    const textToSend = questionText || chatInput;
    if (!textToSend.trim() || isChatLoading || !activeGuide) return;

    const userMsg: ChatMessage = { sender: "user", text: textToSend };
    setChatHistory((prev) => [...prev, userMsg]);
    if (!questionText) setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          question: textToSend,
          studyGuideContext: {
            topicName: activeGuide.topicName,
            simplifiedConcept: activeGuide.simplifiedConcept,
            analogy: activeGuide.analogy,
            vocabulary: activeGuide.vocabulary,
            mindmap: activeGuide.mindmap
          },
          history: chatHistory.slice(-6), // Send recent message history to keep context
          language: appLanguage,
          apiConfig: getApiConfigForFetch()
        }),
      });

      if (!response.ok) {
        throw new Error("Tutor was unable to process the query.");
      }

      const data = await response.json();
      setChatHistory((prev) => [...prev, { sender: "ai", text: data.text }]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "ai", text: `⚠️ **Tutor Timeout:** ${err.message || "I encountered an issue. Please try rephrasing."}` }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Delete a saved study guide
  const handleDeleteGuide = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this study guide?")) return;
    const updated = guides.filter((g) => g.id !== id);
    saveGuides(updated);
    if (activeGuide?.id === id) {
      setActiveGuide(updated.length > 0 ? updated[0] : null);
    }
  };

  const toggleVocab = (term: string) => {
    setRevealedVocab((prev) => ({
      ...prev,
      [term]: !prev[term]
    }));
  };

  const handleCardStatus = (status: "correct" | "review") => {
    if (!activeGuide) return;
    
    const updatedStatus = {
      ...cardStatus,
      [currentCardIndex]: status
    };
    
    setCardStatus(updatedStatus);

    // Save globally
    const updatedGlobal = {
      ...guidesCardStatus,
      [activeGuide.id]: updatedStatus
    };
    setGuidesCardStatus(updatedGlobal);
    localStorage.setItem("feynman_card_statuses", JSON.stringify(updatedGlobal));

    // Calculate mastered count for active guide
    const masteredCount = Object.values(updatedStatus).filter((s) => s === "correct").length;
    const totalCardsCount = activeGuide.flashcards.length;

    if (masteredCount === totalCardsCount && totalCardsCount > 0) {
      try {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#10b981", "#34d399", "#6ee7b7", "#f59e0b", "#3b82f6"]
        });
        
        // Staggered side canons
        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: ["#10b981", "#34d399", "#f59e0b"]
          });
        }, 200);
        
        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: ["#10b981", "#34d399", "#f59e0b"]
          });
        }, 350);
      } catch (err) {
        console.error("Confetti launch failed:", err);
      }
    }

    // Update active guide and guides list
    setGuides((prev) => {
      const updated = prev.map((g) => {
        if (g.id === activeGuide.id) {
          return {
            ...g,
            cardsMasteredCount: masteredCount
          };
        }
        return g;
      });
      localStorage.setItem("feynman_study_guides", JSON.stringify(updated));
      return updated;
    });

    setActiveGuide((prev) => {
      if (prev && prev.id === activeGuide.id) {
        return {
          ...prev,
          cardsMasteredCount: masteredCount
        };
      }
      return prev;
    });

    // Auto advance card after short delay
    if (currentCardIndex < activeGuide.flashcards.length - 1) {
      setTimeout(() => {
        setIsCardFlipped(false);
        setCurrentCardIndex((prev) => prev + 1);
      }, 350);
    }
  };

  // Safe reset for scores
  const resetFlashcards = () => {
    if (!activeGuide) return;
    setCardStatus({});
    
    const updatedGlobal = {
      ...guidesCardStatus,
      [activeGuide.id]: {}
    };
    setGuidesCardStatus(updatedGlobal);
    localStorage.setItem("feynman_card_statuses", JSON.stringify(updatedGlobal));

    // Update guides list
    setGuides((prev) => {
      const updated = prev.map((g) => {
        if (g.id === activeGuide.id) {
          return {
            ...g,
            cardsMasteredCount: 0
          };
        }
        return g;
      });
      localStorage.setItem("feynman_study_guides", JSON.stringify(updated));
      return updated;
    });

    setActiveGuide((prev) => {
      if (prev && prev.id === activeGuide.id) {
        return {
          ...prev,
          cardsMasteredCount: 0
        };
      }
      return prev;
    });

    setCurrentCardIndex(0);
    setIsCardFlipped(false);
  };

  const stepsText = [
    "Deconstructing complex topic into atomic principles...",
    "Drafting elegant, relatable real-world analogies...",
    "Creating an interactive hierarchy for visual node map...",
    "Generating deep active-recall practice cards..."
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row dark:bg-[#060a12] bg-slate-50 transition-colors duration-300 overflow-hidden">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden flex flex-col p-4 bg-white dark:bg-[#090f1a] border-b border-slate-200 dark:border-white/5 text-slate-800 dark:text-white gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span className="font-bold tracking-tight text-sm text-slate-800 dark:text-white">{t.appName}</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            id="mobile_sidebar_toggle"
          >
            {sidebarOpen ? "Hide Guides" : "Show Guides"}
          </button>
        </div>
        <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">🗣️ Language / ভাষা:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAppLanguage("en");
                localStorage.setItem("feynman_app_language", "en");
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] flex items-center justify-center cursor-pointer ${
                appLanguage === "en" ? "bg-emerald-600 text-white shadow" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              🇬🇧 English
            </button>
            <button
              type="button"
              onClick={() => {
                setAppLanguage("bn");
                setBengaliVoiceEnabled(true);
                localStorage.setItem("feynman_app_language", "bn");
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] flex items-center justify-center cursor-pointer ${
                appLanguage === "bn" ? "bg-emerald-600 text-white shadow" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              🇧🇩 বাংলা
            </button>
          </div>
        </div>
      </div>

      {/* SIDEBAR: Saved Guides & Generator */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full md:w-[340px] md:min-w-[340px] border-r dark:border-white/5 border-slate-200 dark:bg-[#090f1a] bg-slate-100 flex flex-col h-[calc(100vh-60px)] md:h-screen shrink-0 overflow-y-auto"
            id="app_sidebar"
          >
            {/* Header branding */}
            <div className="hidden md:flex flex-col p-6 border-b dark:border-white/5 border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-800 dark:text-white text-sm tracking-tight">{t.appName}</h1>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">{t.engineTitle}</p>
                </div>
              </div>

              {/* Language Operating Toggle (English / বাংলা) */}
              <div className="flex items-center justify-between mt-4 p-2.5 bg-slate-200/50 dark:bg-[#0c1221] rounded-xl border border-slate-300 dark:border-white/5">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">🗣️ Play Language:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAppLanguage("en");
                      localStorage.setItem("feynman_app_language", "en");
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[40px] flex items-center justify-center shadow-sm ${
                      appLanguage === "en"
                        ? "bg-emerald-600 text-white"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    🇬🇧 EN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAppLanguage("bn");
                      setBengaliVoiceEnabled(true); // Auto enable Bengali TTS voice when switching app language to Bengali
                      localStorage.setItem("feynman_app_language", "bn");
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[40px] flex items-center justify-center shadow-sm ${
                      appLanguage === "bn"
                        ? "bg-emerald-600 text-white"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    🇧🇩 বাংলা
                  </button>
                </div>
              </div>
            </div>

            {/* AI Generator Panel */}
            <div className="p-5 border-b dark:border-white/5 border-slate-200">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-400 font-mono uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500" /> {t.createGuide}
              </h2>
              
              <form onSubmit={handleGenerate} className="space-y-3.5" id="topic_generation_form">
                <div>
                  <label htmlFor="topic_input" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    {t.topicLabel}
                  </label>
                  <input
                    id="topic_input"
                    type="text"
                    required
                    placeholder={t.topicPlaceholder}
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    disabled={isGenerating}
                    className="w-full text-xs p-3 rounded-lg border dark:border-white/5 border-slate-300 dark:bg-[#0d1425] bg-white text-slate-800 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="context_input" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      {t.extraNotesLabel}
                    </label>
                    <span className="text-[9px] text-slate-500 font-mono">{appLanguage === "en" ? "Enhances accuracy" : "পড়া নির্ভুল করবে"}</span>
                  </div>
                  <textarea
                    id="context_input"
                    placeholder={t.extraNotesPlaceholder}
                    rows={4}
                    value={extraContext}
                    onChange={(e) => setExtraContext(e.target.value)}
                    disabled={isGenerating}
                    className="w-full text-[11px] p-3 rounded-lg border dark:border-white/5 border-slate-300 dark:bg-[#0d1425] bg-white text-slate-800 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !newTopic.trim()}
                  className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  id="submit_generator_btn"
                >
                  {isGenerating ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{t.generatingBtn}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>{t.generateBtn}</span>
                    </>
                  )}
                </button>
              </form>

              {generationError && (
                <div className="mt-3 p-3 bg-red-950/20 border border-red-500/10 text-red-400 text-xs rounded-lg font-mono">
                  {generationError}
                </div>
              )}
            </div>

            {/* List of saved Guides with Search & Filters */}
            <div className="flex-1 flex flex-col p-5 overflow-hidden">
              <div className="mb-3 space-y-3 shrink-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-400 font-mono uppercase tracking-wider">
                    {appLanguage === "en" ? "Your Study Library" : "আমার লাইব্রেরি"} ({guides.length})
                  </span>
                  {selectedTagFilter !== "All" || searchQuery ? (
                    <button
                      onClick={() => { setSearchQuery(""); setSelectedTagFilter("All"); }}
                      className="text-[10px] text-emerald-500 font-mono font-bold hover:underline"
                    >
                      {appLanguage === "en" ? "Clear" : "মুছে ফেলো"}
                    </button>
                  ) : null}
                </div>

                {/* Search input field */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-[11px] pl-8 pr-3 py-2 rounded-lg border dark:border-white/5 border-slate-300 dark:bg-[#0d1425] bg-white text-slate-800 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                  />
                </div>

                {/* Tag horizontal filters container */}
                <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin max-w-full">
                  <button
                    onClick={() => setSelectedTagFilter("All")}
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                      selectedTagFilter === "All"
                        ? "bg-emerald-600 text-white border-emerald-500"
                        : "dark:bg-[#0d1425] bg-white text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                    }`}
                  >
                    All
                  </button>
                  {Array.from(new Set(guides.flatMap((g) => g.tags || []))).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTagFilter(tag)}
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                        selectedTagFilter === tag
                          ? "bg-emerald-600 text-white border-emerald-500"
                          : "dark:bg-[#0d1425] bg-white text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                {/* Pinned Section */}
                {(() => {
                  const pinnedGuides = guides.filter(g => bookmarkedIds.includes(g.id));
                  if (pinnedGuides.length === 0) return null;

                  return (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-yellow-500 dark:text-yellow-400 font-mono uppercase tracking-wider px-1">
                        <Pin className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {appLanguage === "en" ? "Pinned Guides" : "পিন করা গাইডসমূহ"}
                      </div>
                      <div className="space-y-1.5">
                        {pinnedGuides.map((guide) => {
                          const isActive = activeGuide?.id === guide.id;
                          return (
                            <motion.div
                              key={`pinned-${guide.id}`}
                              onClick={() => setActiveGuide(guide)}
                              whileHover={{ y: -2, scale: 1.015 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              className={`group flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                                isActive
                                  ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300 shadow-sm"
                                  : "dark:bg-[#0c1221] bg-white border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-yellow-500/25"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <Bookmark className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                                <div className="truncate text-left">
                                  <p className="text-xs font-semibold truncate leading-tight">{guide.topicName}</p>
                                  <div className="flex items-center gap-1.5 mt-1 overflow-hidden truncate">
                                    <span className="text-[9px] text-slate-500 font-mono shrink-0">{guide.createdAt}</span>
                                    {guide.tags && guide.tags.slice(0, 1).map((t) => (
                                      <span key={t} className="px-1.5 py-0.2 bg-slate-800/60 text-[8px] text-emerald-400 font-mono rounded border border-white/5 truncate max-w-[65px] shrink-0">
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={(e) => toggleBookmark(guide.id, e)}
                                  className="p-1.5 rounded-md hover:bg-yellow-500/10 text-yellow-400 transition-colors"
                                  title="Unpin guide"
                                >
                                  <PinOff className="w-3.5 h-3.5" />
                                </button>
                                
                                {guide.id !== "default-photosynthesis" && (
                                  <button
                                    onClick={(e) => handleDeleteGuide(guide.id, e)}
                                    className="p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-400 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete guide"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Normal Section */}
                <div className="space-y-1.5">
                  {bookmarkedIds.length > 0 && (
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider px-1">
                      {appLanguage === "en" ? "All Guides" : "সকল গাইডসমূহ"}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {(() => {
                      const filteredGuides = guides.filter((g) => {
                        const matchesSearch = g.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (g.tags && g.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                          g.simplifiedConcept.toLowerCase().includes(searchQuery.toLowerCase());
                          
                        const matchesTag = selectedTagFilter === "All" || 
                          (g.tags && g.tags.includes(selectedTagFilter));
                          
                        return matchesSearch && matchesTag;
                      });

                      if (filteredGuides.length === 0) {
                        return (
                          <div className="text-center py-8 text-slate-500 text-xs">
                            No guides found matching filters.
                          </div>
                        );
                      }

                      return filteredGuides.map((guide) => {
                        const isActive = activeGuide?.id === guide.id;
                        const isPinned = bookmarkedIds.includes(guide.id);
                        return (
                          <motion.div
                            key={guide.id}
                            onClick={() => setActiveGuide(guide)}
                            whileHover={{ y: -2, scale: 1.015 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className={`group flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                              isActive
                                ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300 shadow-sm"
                                : "dark:bg-[#0c1221] bg-white border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/10"
                            }`}
                            id={`guide_item_${guide.id}`}
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <Bookmark className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-400"}`} />
                              <div className="truncate text-left">
                                <p className="text-xs font-semibold truncate leading-tight">{guide.topicName}</p>
                                <div className="flex items-center gap-1.5 mt-1 overflow-hidden truncate">
                                  <span className="text-[9px] text-slate-500 font-mono shrink-0">{guide.createdAt}</span>
                                  {guide.tags && guide.tags.slice(0, 1).map((t) => (
                                    <span key={t} className="px-1.5 py-0.2 bg-slate-800/60 text-[8px] text-emerald-400 font-mono rounded border border-white/5 truncate max-w-[65px] shrink-0">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={(e) => toggleBookmark(guide.id, e)}
                                className={`p-1.5 rounded-md hover:bg-yellow-500/10 hover:text-yellow-400 transition-colors ${
                                  isPinned 
                                    ? "text-yellow-400 opacity-100" 
                                    : "text-slate-500 opacity-0 group-hover:opacity-100"
                                }`}
                                title={isPinned ? "Unpin guide" : "Pin guide"}
                              >
                                <Pin className="w-3.5 h-3.5" />
                              </button>
                              
                              {guide.id !== "default-photosynthesis" && (
                                <button
                                  onClick={(e) => handleDeleteGuide(guide.id, e)}
                                  className="p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-400 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Delete guide"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-50 dark:bg-[#05080f]">
        
        {/* Loading overlay for active synthesis */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#060a12]/95 flex flex-col items-center justify-center p-6 text-center"
              id="generator_loading_overlay"
            >
              <div className="max-w-md space-y-6">
                {/* Micro-animations */}
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/10 border-t-emerald-500 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-2 border-yellow-500/10 border-b-yellow-500 animate-spin [animation-duration:3s]" />
                  <div className="absolute inset-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white font-mono tracking-wide">SMART KIDS STUDY KIT AI</h3>
                  <p className="text-xs text-slate-400 font-mono tracking-tight uppercase px-4 py-1.5 bg-[#0e172a] rounded-full border border-white/5 inline-block animate-pulse">
                    {stepsText[generationStep]}
                  </p>
                </div>

                <p className="text-xs text-slate-500 italic">
                  We formulate natural analogies and structure simple node trees using accurate educational pedagogy. This will take roughly 10-25 seconds...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeGuide ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* WORKSPACE HEADER & TABS */}
            <header className="p-6 border-b dark:border-white/5 border-slate-200 dark:bg-[#080d19] bg-white shrink-0 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex flex-col md:flex-row md:items-start gap-3 flex-1">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hidden md:flex p-2 rounded-lg bg-slate-100 dark:bg-[#0c1221] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border dark:border-white/5 border-slate-200 shrink-0"
                  title="Toggle study library sidebar"
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                </button>
                <div className="text-left">
                  <span className="text-[10px] font-mono font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest">Active Study Set</span>
                  <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white tracking-tight mt-0.5 leading-snug">{activeGuide.topicName}</h2>
                  
                  {/* TAG LIST AND ADD TAG */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 max-w-xl text-left">
                    {activeGuide.tags && activeGuide.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400"
                      >
                        <Tag className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                        <span>{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-400 font-bold ml-0.5 shrink-0"
                          title={`Remove tag ${tag}`}
                        >
                          &times;
                        </button>
                      </span>
                    ))}

                    {showTagInput ? (
                      <div className="flex items-center gap-1" id="add_tag_inline_form">
                        <input
                          type="text"
                          placeholder="New tag..."
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddTag(newTagInput);
                            } else if (e.key === "Escape") {
                              setShowTagInput(false);
                            }
                          }}
                          className="px-2 py-0.5 text-[10px] rounded border dark:border-white/10 dark:bg-[#070b14] bg-white text-slate-800 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-20"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddTag(newTagInput)}
                          className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setShowTagInput(false)}
                          className="text-[10px] text-slate-500 font-bold px-1"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowTagInput(true)}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" /> Tag
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* TIMER & MUSIC (SIMPLIFIED FOR KIDS) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-2xl font-bold font-mono border border-indigo-500/20">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{String(timerMinutes).padStart(2, "0")}:{String(timerSeconds).padStart(2, "0")}</span>
                    <button onClick={() => setTimerIsRunning(!timerIsRunning)} className="ml-2 bg-indigo-500 text-white rounded-full p-1 transition-transform hover:scale-110 active:scale-95">
                      {timerIsRunning ? <Pause className="w-3 h-3"/> : <Play className="w-3 h-3"/>}
                    </button>
                    <button onClick={() => {
                        setTimerIsRunning(false);
                        setTimerSeconds(0);
                        if (timerMode === "focus") setTimerMinutes(timerDuration);
                        else setTimerMinutes(5);
                      }} className="ml-1 text-indigo-400 hover:text-indigo-600 p-1 transition-transform hover:rotate-180 duration-300">
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <select
                    value={ambientSound}
                    onChange={(e) => {
                      const sound = e.target.value as any;
                      handleSelectAmbient(sound);
                    }}
                    className="font-bold py-1.5 pl-3 pr-8 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm cursor-pointer appearance-none"
                    style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23d97706%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right .7rem top 50%", backgroundSize: ".65rem auto" }}
                  >
                    <option value="none">{appLanguage === "en" ? "🤫 No Music" : "🤫 নীরব"}</option>
                    <option value="rainforest">{appLanguage === "en" ? "🌧️ Rainforest" : "🌧️ বৃষ্টি বন"}</option>
                    <option value="library">{appLanguage === "en" ? "📚 Library" : "📚 লাইব্রেরি"}</option>
                    <option value="lofi">{appLanguage === "en" ? "🎵 Lofi Beats" : "🎵 লো-ফাই বিট"}</option>
                  </select>

                  <button
                    onClick={handleToggleTheme}
                    className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0c1221] dark:hover:bg-[#11192e] text-amber-500 dark:text-yellow-400 border border-slate-200 dark:border-white/5 transition-all shadow-sm flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
                    title={isDarkMode ? "Switch to daylight light mode" : "Switch to starry dark mode"}
                    id="global_theme_toggle_btn"
                  >
                    {isDarkMode ? (
                      <Sun className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-indigo-600" />
                    )}
                  </button>
                </div>
              </div>
            </header>

            {/* TOP NAVIGATION DOCK (MOVED TO TOP) */}
            <div className="bg-white dark:bg-[#080d19] border-b dark:border-white/5 border-slate-200 p-2 md:p-3 shrink-0 flex justify-center z-40 w-full shadow-sm sticky top-0">
              <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 max-w-full w-full justify-start md:justify-center no-scrollbar px-2">
                  {([
                    { id: "feynman", label: t.feynmanDeconstruction, icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { id: "mindmap", label: t.mindmap, icon: Compass, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { id: "flashcards", label: t.flashcards, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { id: "clarifier", label: t.clarifier, icon: HelpCircle, color: "text-purple-500", bg: "bg-purple-500/10" },
                    { id: "voiceChat", label: t.voiceChat, icon: Mic, color: "text-rose-500", bg: "bg-rose-500/10" },
                    { id: "dashboard", label: t.dashboard, icon: BarChart2, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                    { id: "parents", label: t.parentsCorner, icon: Sliders, color: "text-pink-500", bg: "bg-pink-500/10" }
                  ] as const).map((tab) => {
                    const Icon = tab.icon;
                    const isSelected = activeTab === tab.id;
                    const isChatTab = tab.id === "clarifier" || tab.id === "voiceChat";

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`relative flex flex-col items-center justify-center gap-1 p-1.5 sm:px-4 sm:py-2.5 rounded-[16px] transition-transform active:scale-95 shrink-0 cursor-pointer min-w-[70px] sm:min-w-[90px] z-10 ${
                          isSelected
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                        id={`tab_btn_${tab.id}`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="activeTabIndicatorTop"
                            className={`absolute inset-0 ${tab.bg} rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm`}
                            initial={false}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10 flex flex-col items-center gap-1">
                          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isSelected ? tab.color : ""} ${isChatTab && !isSelected ? "animate-pulse" : ""}`} />
                          <span className={`text-[9px] sm:text-[11px] font-bold font-heading ${isSelected ? "opacity-100" : "opacity-70"} text-center leading-tight max-w-[80px]`}>
                            {tab.label}
                          </span>
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* TAB CONTAINER CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <AnimatePresence mode="wait">
                
                {/* TAB 1: FEYNMAN DECONSTRUCTION */}
                {activeTab === "feynman" && (
                  <motion.div
                    key="feynman"
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -25 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="max-w-4xl mx-auto space-y-8"
                  >
                    {/* Simplified explanation card */}
                    <div className="p-6 md:p-8 rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-[#080d19] bg-white shadow-xl relative overflow-hidden text-left animate-fade-in">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 pb-4 border-b dark:border-white/5 border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/10 font-bold uppercase tracking-widest">
                            {t.kidModeActive} 👶✨
                          </span>
                          <span className="text-xs text-slate-500">• {appLanguage === "en" ? "Super Easy Words" : "সহজ ভাষায় সাজানো"}</span>
                        </div>
                        
                        {/* Playful TTS Speed and Language Control Panel (COLLAPSIBLE) */}
                        <div className="w-full xl:w-auto min-w-[280px]">
                          <button
                            type="button"
                            onClick={() => setIsTtsPanelCollapsed(!isTtsPanelCollapsed)}
                            className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-[#0c1221] dark:hover:bg-[#131b2e] border border-slate-200 dark:border-white/5 rounded-xl transition-all font-bold text-[11px] text-slate-700 dark:text-slate-300 shadow-sm cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <span>🎙️</span>
                              <span>{appLanguage === "en" ? "Voice Settings" : "কণ্ঠ সেটিংস"}</span>
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-mono font-normal">
                                {isTtsPanelCollapsed ? (appLanguage === "en" ? "Show" : "দেখুন") : (appLanguage === "en" ? "Hide" : "লুকান")}
                              </span>
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isTtsPanelCollapsed ? "" : "rotate-180 text-emerald-400"}`} />
                          </button>

                          <AnimatePresence initial={false}>
                            {!isTtsPanelCollapsed && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="overflow-hidden mt-3"
                              >
                                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-slate-50 dark:bg-[#0c1221] p-4 rounded-2xl border border-slate-200 dark:border-white/5 w-full" id="tts_settings_panel">
                                  <div className="flex items-center justify-between gap-3 flex-1">
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">🗣️ {t.voicesettings}:</span>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setBengaliVoiceEnabled(false);
                                          localStorage.setItem("feynman_bengali_voice", "false");
                                        }}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] min-w-[64px] flex items-center justify-center cursor-pointer shadow-sm ${
                                          !bengaliVoiceEnabled
                                            ? "bg-emerald-600 text-white"
                                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border dark:border-white/5 border-slate-200"
                                        }`}
                                      >
                                        English
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setBengaliVoiceEnabled(true);
                                          localStorage.setItem("feynman_bengali_voice", "true");
                                        }}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] min-w-[64px] flex items-center justify-center cursor-pointer shadow-sm ${
                                          bengaliVoiceEnabled
                                            ? "bg-emerald-600 text-white"
                                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border dark:border-white/5 border-slate-200"
                                        }`}
                                      >
                                        বাংলা
                                      </button>
                                    </div>
                                  </div>

                                  <div className="h-px lg:h-8 w-full lg:w-px bg-slate-200 dark:bg-white/10" />

                                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 justify-between">
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">{t.playbacksymmetric}:</span>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                      {/* Slow down button */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newRate = Math.max(0.5, parseFloat((ttsRate - 0.1).toFixed(1)));
                                          setTtsRate(newRate);
                                          localStorage.setItem("feynman_tts_rate", newRate.toString());
                                        }}
                                        className="w-11 h-11 rounded-xl bg-white dark:bg-[#131b2e] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-lg font-bold shadow-sm transition-all cursor-pointer min-h-[44px] min-w-[44px] border dark:border-white/5 border-slate-200"
                                        title="Slow down speed"
                                      >
                                        🐢
                                      </button>

                                      {/* Thicker and larger slider */}
                                      <input
                                        type="range"
                                        min="0.5"
                                        max="2.0"
                                        step="0.1"
                                        value={ttsRate}
                                        onChange={(e) => {
                                          const rate = parseFloat(e.target.value);
                                          setTtsRate(rate);
                                          localStorage.setItem("feynman_tts_rate", rate.toString());
                                        }}
                                        className="flex-1 sm:w-28 accent-emerald-500 cursor-pointer h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
                                      />

                                      {/* Speed up button */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newRate = Math.min(2.0, parseFloat((ttsRate + 0.1).toFixed(1)));
                                          setTtsRate(newRate);
                                          localStorage.setItem("feynman_tts_rate", newRate.toString());
                                        }}
                                        className="w-11 h-11 rounded-xl bg-white dark:bg-[#131b2e] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-lg font-bold shadow-sm transition-all cursor-pointer min-h-[44px] min-w-[44px] border dark:border-white/5 border-slate-200"
                                        title="Speed up speed"
                                      >
                                        🚀
                                      </button>

                                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                        {ttsRate.toFixed(1)}x
                                      </span>
                                    </div>
                                  </div>

                                  <div className="h-px lg:h-8 w-full lg:w-px bg-slate-200 dark:bg-white/10" />

                                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 justify-between">
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">🤖 {appLanguage === "en" ? "Voice Character" : "কণ্ঠের চরিত্র"}:</span>
                                    <div className="flex gap-1.5 w-full sm:w-auto">
                                      {([
                                        { id: "teacher", label: appLanguage === "en" ? "Teacher 👩‍🏫" : "শিক্ষক 👩‍🏫" },
                                        { id: "robot", label: appLanguage === "en" ? "Robot 🤖" : "রোবট 🤖" },
                                        { id: "kid", label: appLanguage === "en" ? "Kid 🧒" : "শিশু 🧒" }
                                      ] as const).map((persona) => {
                                        const isSelected = voicePersona === persona.id;
                                        return (
                                          <button
                                            key={persona.id}
                                            type="button"
                                            onClick={() => {
                                              setVoicePersona(persona.id);
                                              localStorage.setItem("feynman_voice_persona", persona.id);
                                            }}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] flex items-center justify-center cursor-pointer shadow-sm flex-1 sm:flex-none ${
                                              isSelected
                                                ? "bg-emerald-600 text-white"
                                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border dark:border-white/5 border-slate-200"
                                            }`}
                                          >
                                            {persona.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 pb-4 border-b dark:border-white/5 border-slate-100 cursor-pointer select-none" onClick={() => setIsSimplifiedConceptCollapsed(!isSimplifiedConceptCollapsed)}>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">🐻 {appLanguage === "en" ? "Simplified Essence & Detailed Dashboard" : "সহজ পাঠ ও অধ্যায় ড্যাশবোর্ড"}</h3>
                          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isSimplifiedConceptCollapsed ? "" : "rotate-180"}`} />
                        </div>
                        <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {(() => {
                            const currentChapter = activeGuide.chapterDetails || {
                              fullText: activeGuide.simplifiedConcept,
                              briefSummary: activeGuide.simplifiedConcept.split("।").filter(s => s.trim()).map(s => `- ${s.trim()}।`).join("\n") || activeGuide.simplifiedConcept.split(".").filter(s => s.trim()).map(s => `- ${s.trim()}.`).join("\n"),
                              contextAndFunFacts: appLanguage === "en" 
                                ? `This magical lesson deconstructs the topic "${activeGuide.topicName}" for simple kids understanding. Read through the text verbatim, look at the summary cards, and discover the awesome backstory context!` 
                                : `এই মজার পড়াটি মূলত "${activeGuide.topicName}" বিষয়টি অত্যন্ত সহজ ও আনন্দের সাথে শেখার জন্য তৈরি করা হয়েছে। মূল টেক্সটটি নিখুঁতভাবে পড়ার পর এর সংক্ষিপ্ত সারমর্ম এবং লেখক বা ইতিহাস সম্পর্কিত চমকপ্রদ তথ্য জেনে নাও!`
                            };
                            const textToSpeak = chapterSubTab === "text" ? currentChapter.fullText : chapterSubTab === "brief" ? currentChapter.briefSummary : currentChapter.contextAndFunFacts;
                            const isCurrentlySpeaking = isSpeaking && spokenText === textToSpeak;

                            return (
                              <>
                                <button
                                  onClick={() => speakText(textToSpeak)}
                                  className={`px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-xs md:text-sm font-bold min-h-[44px] ${
                                    isCurrentlySpeaking
                                      ? "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-md"
                                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:scale-[1.02]"
                                  }`}
                                  title="Listen to this section explanation"
                                >
                                  {isCurrentlySpeaking ? (
                                    <>
                                      <VolumeX className="w-5 h-5 shrink-0" />
                                      <span>{appLanguage === "en" ? "Stop Speaking 🛑" : "বলা বন্ধ করো 🛑"}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 className="w-5 h-5 shrink-0" />
                                      <span>{appLanguage === "en" ? "Read Aloud 🔊" : "মুখে শুনো 🔊"}</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() => {
                                    if (typeof window !== "undefined") {
                                      window.print();
                                    }
                                  }}
                                  className="px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-xs md:text-sm font-bold min-h-[44px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border dark:border-white/5 border-slate-200 shadow-sm hover:scale-[1.02]"
                                  title="Print study guide as PDF"
                                >
                                  <Printer className="w-4 h-4 shrink-0" />
                                  <span>{appLanguage === "en" ? "Print Guide" : "পড়া প্রিন্ট করো"}</span>
                                </button>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {!isSimplifiedConceptCollapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            {(() => {
                              const currentChapter = activeGuide.chapterDetails || {
                                fullText: activeGuide.simplifiedConcept,
                                briefSummary: activeGuide.simplifiedConcept.split("।").filter(s => s.trim()).map(s => `- ${s.trim()}।`).join("\n") || activeGuide.simplifiedConcept.split(".").filter(s => s.trim()).map(s => `- ${s.trim()}.`).join("\n"),
                                contextAndFunFacts: appLanguage === "en" 
                                  ? `This magical lesson deconstructs the topic "${activeGuide.topicName}" for simple kids understanding. Read through the text verbatim, look at the summary cards, and discover the awesome backstory context!` 
                                  : `এই মজার পড়াটি মূলত "${activeGuide.topicName}" বিষয়টি অত্যন্ত সহজ ও আনন্দের সাথে শেখার জন্য তৈরি করা হয়েছে। মূল টেক্সটটি নিখুঁতভাবে পড়ার পর এর সংক্ষিপ্ত সারমর্ম এবং লেখক বা ইতিহাস সম্পর্কিত চমকপ্রদ তথ্য জেনে নাও!`
                              };

                              return (
                                <div className="space-y-6 pt-2">
                                  {/* Sub-tabs selection */}
                                  <div className="flex border-b border-slate-100 dark:border-white/5 gap-1 md:gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setChapterSubTab("text")}
                                      className={`px-3 md:px-5 py-2.5 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                                        chapterSubTab === "text"
                                          ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold"
                                          : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                      }`}
                                    >
                                      📖 {appLanguage === "en" ? "Full Text" : "মূল পড়া (কবিতা/গল্প)"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setChapterSubTab("brief")}
                                      className={`px-3 md:px-5 py-2.5 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                                        chapterSubTab === "brief"
                                          ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold"
                                          : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                      }`}
                                    >
                                      📝 {appLanguage === "en" ? "Summary Brief" : "সংক্ষিপ্ত সারমর্ম"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setChapterSubTab("backstory")}
                                      className={`px-3 md:px-5 py-2.5 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                                        chapterSubTab === "backstory"
                                          ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold"
                                          : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                      }`}
                                    >
                                      🎭 {appLanguage === "en" ? "Backstory Context" : "লেখক পরিচিতি ও ইতিহাস"}
                                    </button>
                                  </div>

                                  {/* Sub-tab Content Panels */}
                                  <AnimatePresence mode="wait">
                                    {chapterSubTab === "text" && (
                                      <motion.div
                                        key="chapter-text"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        className="space-y-4"
                                      >
                                        {/* Kids Reading tools */}
                                        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0c1221] border border-slate-200 dark:border-white/5">
                                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                            📏 {appLanguage === "en" ? "Reading Focus Guide:" : "সহজে পড়ার ম্যাজিক স্কেল:"}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setFocusRulerActive(!focusRulerActive);
                                                if (!focusRulerActive) setFocusRulerPosition(0);
                                              }}
                                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                                focusRulerActive 
                                                  ? "bg-purple-600 text-white shadow-sm" 
                                                  : "bg-white dark:bg-[#131b2e] text-slate-700 dark:text-slate-300 border dark:border-white/5 border-slate-200"
                                              }`}
                                            >
                                              {focusRulerActive ? "Ruler ON" : "Ruler OFF"}
                                            </button>
                                            {focusRulerActive && (
                                              <div className="flex items-center gap-1" id="ruler-controls">
                                                <button
                                                  type="button"
                                                  onClick={() => setFocusRulerPosition(prev => prev === null ? 0 : Math.max(0, prev - 1))}
                                                  className="p-1 w-6 h-6 rounded bg-white dark:bg-[#131b2e] border dark:border-white/5 border-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                                                  title="Move focus highlight line up"
                                                >
                                                  ▲
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => setFocusRulerPosition(prev => prev === null ? 0 : prev + 1)}
                                                  className="p-1 w-6 h-6 rounded bg-white dark:bg-[#131b2e] border dark:border-white/5 border-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                                                  title="Move focus highlight line down"
                                                >
                                                  ▼
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        <div className="p-6 md:p-8 rounded-2xl bg-slate-50/50 dark:bg-[#070b14]/50 border border-slate-200 dark:border-white/5">
                                          <div className="space-y-4">
                                            {currentChapter.fullText.split("\n").map((line, idx) => {
                                              const isHighlighted = focusRulerActive && focusRulerPosition === idx;
                                              if (!line.trim()) return <div key={idx} className="h-4" />;
                                              return (
                                                <p
                                                  key={idx}
                                                  onClick={() => {
                                                    if (focusRulerActive) setFocusRulerPosition(idx);
                                                  }}
                                                  className={`text-lg md:text-xl font-medium tracking-wide leading-relaxed p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                                                    isHighlighted
                                                      ? "bg-yellow-100 dark:bg-yellow-950/30 text-slate-950 dark:text-yellow-100 border-l-4 border-yellow-500 font-bold scale-[1.01]"
                                                      : "text-black dark:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-white/5"
                                                  }`}
                                                >
                                                  {line}
                                                </p>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}

                                    {chapterSubTab === "brief" && (
                                      <motion.div
                                        key="chapter-brief"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                      >
                                        {currentChapter.briefSummary.split("\n").filter(line => line.trim()).map((bullet, idx) => (
                                          <div key={idx} className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 dark:bg-[#070b13] bg-slate-50/50 text-left flex gap-4 items-start shadow-sm">
                                            <span className="text-2xl shrink-0 mt-0.5">⭐</span>
                                            <p className="text-sm md:text-md text-black dark:text-slate-100 font-semibold leading-relaxed whitespace-pre-wrap">
                                              {bullet.replace(/^-\s*/, "").replace(/^\*\s*/, "")}
                                            </p>
                                          </div>
                                        ))}
                                      </motion.div>
                                    )}

                                    {chapterSubTab === "backstory" && (
                                      <motion.div
                                        key="chapter-backstory"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        className="p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-500/10 text-left relative overflow-hidden"
                                      >
                                        <div className="absolute right-4 bottom-4 text-8xl opacity-10 select-none">🎭</div>
                                        <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
                                          <span>📜 {appLanguage === "en" ? "Author Backstory & Topic Context" : "পটভূমি, ইতিহাস ও লেখক পরিচিতি"}</span>
                                        </h4>
                                        <p className="text-sm md:text-md leading-relaxed text-black dark:text-slate-100 font-medium whitespace-pre-wrap">
                                          {currentChapter.contextAndFunFacts}
                                        </p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })()}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
 
                     {/* Analogy & everyday scenario */}
                     <div className="p-6 md:p-8 rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-[#0a1224] bg-white shadow-xl relative overflow-hidden text-left">
                       <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-500" />
                       
                       <div 
                         className="flex justify-between items-center cursor-pointer select-none mb-2 pb-2 border-b border-dashed border-slate-100 dark:border-white/5"
                         onClick={() => setIsAnalogyCollapsed(!isAnalogyCollapsed)}
                       >
                         <div className="flex items-center gap-2">
                           <span className="text-[10px] font-mono bg-yellow-500/15 text-yellow-400 px-2.5 py-1 rounded-full border border-yellow-500/10 font-bold uppercase tracking-widest">
                             Pedagogical Analogy
                           </span>
                           <span className="text-xs text-slate-500">• Anchor of Understanding</span>
                         </div>
                         <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isAnalogyCollapsed ? "" : "rotate-180"}`} />
                       </div>

                       <AnimatePresence initial={false}>
                         {!isAnalogyCollapsed && (
                           <motion.div
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: "auto", opacity: 1 }}
                             exit={{ height: 0, opacity: 0 }}
                             transition={{ duration: 0.25, ease: "easeInOut" }}
                             className="overflow-hidden"
                           >
                             <div className="flex flex-col md:flex-row gap-6 items-start pt-4">
                         <div className="p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 shrink-0">
                           <Lightbulb className="w-6 h-6" />
                         </div>
                         <div className="space-y-3 flex-1">
                           <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                             <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">{t.everydayAnalogy}</h3>
                             <button
                               onClick={() => speakText(activeGuide.analogy)}
                               className={`px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-xs md:text-sm font-bold min-h-[44px] ${
                                 isSpeaking && spokenText === activeGuide.analogy
                                   ? "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-md"
                                   : "bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-md hover:scale-[1.02]"
                               }`}
                               title="Listen to analogy explanation"
                             >
                               {isSpeaking && spokenText === activeGuide.analogy ? (
                                 <>
                                   <VolumeX className="w-5 h-5 shrink-0" />
                                   <span>{appLanguage === "en" ? "Stop Speaking 🛑" : "বলা বন্ধ করো 🛑"}</span>
                                 </>
                               ) : (
                                 <>
                                   <Volume2 className="w-5 h-5 shrink-0" />
                                   <span>{appLanguage === "en" ? "Read Analogy 🔊" : "মুখে শুনো 🔊"}</span>
                                 </>
                               )}
                             </button>
                           </div>
                          <p className="text-sm dark:text-slate-300 text-black leading-relaxed font-sans font-medium">
                            {activeGuide.analogy}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

                    {/* Jargon Demystification: Interactive Glossary */}
                    <div className="space-y-4 text-left">
                      <div 
                        className="flex justify-between items-center cursor-pointer select-none pb-2 border-b dark:border-white/5 border-slate-100"
                        onClick={() => setIsVocabularyCollapsed(!isVocabularyCollapsed)}
                      >
                        <div>
                          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-400 font-mono uppercase tracking-widest flex items-center gap-2">
                            <span>📚 {t.demystifyingJargon}</span>
                            <span className="text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full font-mono font-normal normal-case">
                              {isVocabularyCollapsed ? (appLanguage === "en" ? "Show" : "দেখুন") : (appLanguage === "en" ? "Hide" : "লুকান")}
                            </span>
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {t.demystifyingJargonDesc}
                          </p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isVocabularyCollapsed ? "" : "rotate-180 text-purple-400"}`} />
                      </div>

                      <AnimatePresence initial={false}>
                        {!isVocabularyCollapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        {activeGuide.vocabulary && activeGuide.vocabulary.map((vocab) => {
                          const isRevealed = revealedVocab[vocab.term];
                          return (
                            <motion.div
                              key={vocab.term}
                              onClick={() => toggleVocab(vocab.term)}
                              whileHover={{ y: -3, scale: 1.015, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)" }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left select-none ${
                                isRevealed
                                  ? "bg-emerald-950/10 border-emerald-500/20 text-emerald-300"
                                  : "dark:bg-[#070b13] bg-white border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/10"
                              }`}
                              id={`vocab_item_${vocab.term}`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold tracking-wide text-slate-800 dark:text-white font-mono">
                                  {vocab.term}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                                  {isRevealed ? t.hideDefinition : t.revealExplanation}
                                </span>
                              </div>

                              <AnimatePresence initial={false}>
                                {isRevealed && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-3 pt-3 border-t dark:border-white/5 border-slate-200"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-sans flex-1">
                                        {vocab.simpleDefinition}
                                      </p>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation(); // Avoid closing terminology explanation box
                                          speakText(vocab.simpleDefinition);
                                        }}
                                        className={`p-1.5 rounded-md transition-all cursor-pointer shrink-0 ${
                                          isSpeaking && spokenText === vocab.simpleDefinition
                                            ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 animate-pulse"
                                            : "bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-emerald-400 dark:hover:text-emerald-300"
                                        }`}
                                        title="Listen to term definition read aloud"
                                      >
                                        <Volume2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CSS stylesheet injected for print-specific visibility override */}
                    <style dangerouslySetInnerHTML={{ __html: `
                      @media print {
                        body, html, #__next, [data-reactroot], #root {
                          background: white !important;
                          color: #000000 !important;
                        }
                        /* Hide standard page panels to avoid print clutter */
                        aside, 
                        nav, 
                        header, 
                        button, 
                        input, 
                        textarea,
                        .no-print,
                        #tts_settings_panel,
                        #sidebar_panel,
                        #main-header-panel,
                        #tabs-navigation-panel,
                        #pomodoro_timer_panel,
                        .print-hide {
                          display: none !important;
                        }
                        /* Ensure the custom print block is visible */
                        #feynman-print-area {
                          display: block !important;
                          position: absolute !important;
                          left: 0 !important;
                          top: 0 !important;
                          width: 100% !important;
                          margin: 0 !important;
                          padding: 30px !important;
                          background: white !important;
                          color: black !important;
                          box-shadow: none !important;
                          border: none !important;
                        }
                        #feynman-print-area * {
                          color: black !important;
                          background: transparent !important;
                        }
                      }
                    `}} />

                    {/* Print-Only Beautiful Layout */}
                    <div className="hidden print:block" id="feynman-print-area">
                      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: 'black' }}>
                        <div style={{ borderBottom: '2px solid black', paddingBottom: '12px', marginBottom: '24px' }}>
                          <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 6px 0' }}>
                            📚 Study Guide: {activeGuide.topicName}
                          </h1>
                          <p style={{ fontSize: '12px', color: '#666666', margin: '0' }}>
                            {appLanguage === "en" ? "Deconstructed with Smart Kids Study Kit" : "স্মার্ট প্যারেন্টিং কিডস স্টাডি কিট (সহজ পাঠ গাইড)"}
                          </p>
                        </div>
                        
                        <div style={{ marginBottom: '28px' }}>
                          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', borderBottom: '1px solid #eeeeee', paddingBottom: '6px', marginBottom: '12px' }}>
                            🐻 {appLanguage === "en" ? "The Simplified Essence" : "সহজ ভাষায় মূল বিষয়"}
                          </h2>
                          <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#222222', whiteSpace: 'pre-wrap', margin: '0' }}>
                            {activeGuide.simplifiedConcept}
                          </p>
                        </div>

                        <div style={{ marginBottom: '28px' }}>
                          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b', borderBottom: '1px solid #eeeeee', paddingBottom: '6px', marginBottom: '12px' }}>
                            💡 {appLanguage === "en" ? "The Everyday Analogy" : "রোজকার জীবনের উদাহরণ"}
                          </h2>
                          <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#222222', whiteSpace: 'pre-wrap', margin: '0' }}>
                            {activeGuide.analogy}
                          </p>
                        </div>

                        {activeGuide.vocabulary && activeGuide.vocabulary.length > 0 && (
                          <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6', borderBottom: '1px solid #eeeeee', paddingBottom: '6px', marginBottom: '16px' }}>
                              🔑 {appLanguage === "en" ? "Demystified Vocabulary" : "কঠিন শব্দের সহজ মানে"}
                            </h2>
                            <div style={{ display: 'grid', gap: '16px' }}>
                              {activeGuide.vocabulary.map((vocab, index) => (
                                <div key={index} style={{ paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                                  <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#000000' }}>{vocab.term}</p>
                                  <p style={{ fontSize: '13px', color: '#444444', margin: '0', lineHeight: '1.4' }}>{vocab.simpleDefinition}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div style={{ marginTop: '50px', borderTop: '1px solid #dddddd', paddingTop: '15px', textAlign: 'center', fontSize: '11px', color: '#888888' }}>
                          {appLanguage === "en" 
                            ? "Generated with Smart Kids Study Kit 🐻✨ — Active Recall & Simplicity" 
                            : "স্মার্ট কিডস স্টাডি কিট 🐻✨ দ্বারা তৈরি — একটি সুন্দর এবং সহজ পড়ালেখা সহকারী"}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* TAB 2: INTERACTIVE MIND MAP */}
                {activeTab === "mindmap" && (
                  <motion.div
                    key="mindmap"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="max-w-6xl mx-auto space-y-6"
                  >
                    {/* Header Intro and Dynamic Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#080d19] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                      <div className="text-left">
                        <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/10 font-bold uppercase tracking-widest">
                          {appLanguage === "en" ? " Whiteboard Studio" : " হোয়াইটবোর্ড স্টুডিও"}
                        </span>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight mt-2.5 flex items-center gap-2">
                          {appLanguage === "en" ? "Interactive Mind Map" : "ইন্টারেক্টিভ মাইন্ড ম্যাপ"}
                          <Sparkles className="w-4 h-4 text-amber-400 animate-bounce" />
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {appLanguage === "en" ? "Drag to pan, scroll to zoom. Solve riddles & trace magic flows!" : "টেনে প্যান করুন, জুম করতে মাউস ঘুরান। ধাঁধা সমাধান করুন ও জাদুকরী প্রবাহ দেখুন!"}
                        </p>
                      </div>

                      {/* Whiteboard Controls toolbar */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Zoom buttons */}
                        <div className="flex items-center bg-slate-100 dark:bg-[#0c1221] p-1 rounded-xl border border-slate-200 dark:border-white/5">
                          <button
                            onClick={() => setMindmapZoom(prev => Math.min(prev + 0.15, 2.0))}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5 text-xs font-bold cursor-pointer transition-colors"
                            title="Zoom In"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] font-mono px-2 text-slate-500 dark:text-slate-400 font-bold">
                            {Math.round(mindmapZoom * 100)}%
                          </span>
                          <button
                            onClick={() => setMindmapZoom(prev => Math.max(prev - 0.15, 0.5))}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5 text-xs font-bold cursor-pointer transition-colors"
                            title="Zoom Out"
                          >
                            <span className="block w-3.5 h-0.5 bg-current mx-auto" />
                          </button>
                          <button
                            onClick={() => {
                              setMindmapZoom(1);
                              setMindmapPanX(0);
                              setMindmapPanY(0);
                            }}
                            className="p-1.5 ml-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            title="Reset Position"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Magic flow pulse trigger */}
                        <button
                          onClick={() => {
                            setMindmapPulseActive(true);
                            setTimeout(() => setMindmapPulseActive(false), 3000);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${
                            mindmapPulseActive
                              ? "bg-emerald-500 text-white border-emerald-400 animate-pulse"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                          }`}
                          title="Trigger a crawl of light along the links"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{appLanguage === "en" ? "Magic Flow ✨" : "জাদুকরী প্রবাহ ✨"}</span>
                        </button>

                        {/* Active Recall Game Toggle */}
                        <button
                          onClick={() => {
                            setMindmapActiveRecall(!mindmapActiveRecall);
                            setMindmapGuessedNodes({});
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${
                            mindmapActiveRecall
                              ? "bg-cyan-500 text-white border-cyan-400"
                              : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20"
                          }`}
                        >
                          <span>🧩 {appLanguage === "en" ? "Riddle Mode" : "ধাঁধা গেম"}</span>
                        </button>
                      </div>
                    </div>

                    {/* SVG canvas rendering layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                      
                      {/* Visual Graph panel */}
                      <div className="lg:col-span-8 p-4 rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-[#070b14] bg-[#fafbfc] flex flex-col min-h-[460px] shadow-inner relative overflow-hidden group select-none">
                        
                        {/* Interactive Drag Hint */}
                        <div className="absolute top-3 left-3 z-20 pointer-events-none flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] text-slate-300 font-mono tracking-wider">
                          <Compass className="w-3 h-3 text-cyan-400 animate-spin" />
                          <span>{appLanguage === "en" ? "WHITEBOARD BOARD: CLICK & DRAG TO PAN" : "হোয়াইটবোর্ড: টেনে প্যান করুন"}</span>
                        </div>

                        {/* Whiteboard Background Grid */}
                        <div className="absolute inset-0 dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-35" />

                        {/* Node Tree Rendered elegantly as SVG */}
                        <svg className="w-full h-[410px] relative z-10 overflow-hidden cursor-grab active:cursor-grabbing" viewBox="0 0 600 400">
                          <defs>
                            {/* Radial Glow Filters for premium design */}
                            <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="5" result="blur" />
                              <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="4" result="blur" />
                              <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="4" result="blur" />
                              <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                          </defs>

                          {/* DRAGGABLE ROOT CANVAS GROUP */}
                          <motion.g
                            drag
                            dragMomentum={false}
                            dragElastic={0.05}
                            animate={{ scale: mindmapZoom, x: mindmapPanX, y: mindmapPanY }}
                            transition={{ type: "spring", stiffness: 220, damping: 24 }}
                          >
                            {(() => {
                              const rootNode = activeGuide.mindmap;
                              const categories = rootNode.children || [];
                              const rootX = 300;
                              const rootY = 55;
                              
                              return (
                                <g>
                                  {/* Draw CONNECTIONS first */}
                                  {categories.map((cat, idx) => {
                                    // Symmetrical spread
                                    const gapX = 320 / (categories.length + 1 || 2);
                                    const catX = gapX * (idx + 1) + 140;
                                    const catY = 185;

                                    // Curved line from Root to Category
                                    const controlY1 = (rootY + catY) / 2;
                                    const pathD = `M ${rootX} ${rootY} C ${rootX} ${controlY1}, ${catX} ${controlY1}, ${catX} ${catY}`;

                                    return (
                                      <g key={`link-cat-${idx}`}>
                                        {/* Background curve line */}
                                        <path
                                          d={pathD}
                                          fill="none"
                                          stroke="rgba(16, 185, 129, 0.18)"
                                          strokeWidth="3.5"
                                        />

                                        {/* Flow pulse light effect */}
                                        {(mindmapPulseActive || isSpeaking) && (
                                          <motion.path
                                            d={pathD}
                                            fill="none"
                                            stroke="#10b981"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                            strokeDasharray="12 20"
                                            animate={{ strokeDashoffset: [0, -64] }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                          />
                                        )}

                                        {/* Sub-connections to details */}
                                        {(cat.children || []).map((det, detIdx) => {
                                          const numDetails = cat.children?.length || 1;
                                          const detGap = 135 / (numDetails + 1 || 2);
                                          const detX = catX - 65 + detGap * (detIdx + 1);
                                          const detY = 325;

                                          const subControlY = (catY + detY) / 2;
                                          const subPathD = `M ${catX} ${catY} C ${catX} ${subControlY}, ${detX} ${subControlY}, ${detX} ${detY}`;

                                          return (
                                            <g key={`sublink-${idx}-${detIdx}`}>
                                              {/* Background detail link line */}
                                              <path
                                                d={subPathD}
                                                fill="none"
                                                stroke="rgba(6, 182, 212, 0.12)"
                                                strokeWidth="2.5"
                                              />

                                              {/* Detail flow pulse light effect */}
                                              {(mindmapPulseActive || isSpeaking) && (
                                                <motion.path
                                                  d={subPathD}
                                                  fill="none"
                                                  stroke="#06b6d4"
                                                  strokeWidth="2.5"
                                                  strokeLinecap="round"
                                                  strokeDasharray="8 16"
                                                  animate={{ strokeDashoffset: [0, -48] }}
                                                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                                                />
                                              )}
                                            </g>
                                          );
                                        })}
                                      </g>
                                    );
                                  })}

                                  {/* ROOT NODE */}
                                  <motion.g 
                                    className="cursor-pointer"
                                    onClick={() => setSelectedNode({ name: rootNode.name, description: rootNode.description })}
                                    whileHover={{ scale: 1.12 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                  >
                                    {/* Orbit Spinning outer ring */}
                                    <motion.circle
                                      cx={rootX}
                                      cy={rootY}
                                      r="34"
                                      fill="none"
                                      stroke="rgba(16, 185, 129, 0.25)"
                                      strokeWidth="1.5"
                                      strokeDasharray="6 4"
                                      animate={{ rotate: 360 }}
                                      transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                                    />
                                    {/* Central Core Globe */}
                                    <circle
                                      cx={rootX}
                                      cy={rootY}
                                      r="24"
                                      filter="url(#glow-emerald)"
                                      className={`transition-all duration-300 fill-emerald-950 stroke-[3.5] ${
                                        selectedNode?.name === rootNode.name 
                                          ? "stroke-emerald-400" 
                                          : "stroke-emerald-600/80 hover:stroke-emerald-400"
                                      }`}
                                    />
                                    {/* Star Emoji inside Root */}
                                    <text
                                      x={rootX}
                                      y={rootY + 5}
                                      textAnchor="middle"
                                      className="text-xs pointer-events-none select-none"
                                    >
                                      👑
                                    </text>
                                    {/* Node Label */}
                                    <text
                                      x={rootX}
                                      y={rootY - 40}
                                      textAnchor="middle"
                                      className="font-sans text-[12px] font-extrabold fill-slate-800 dark:fill-white pointer-events-none drop-shadow-sm select-none"
                                    >
                                      {rootNode.name}
                                    </text>
                                  </motion.g>

                                  {/* CATEGORIES */}
                                  {categories.map((cat, idx) => {
                                    const gapX = 320 / (categories.length + 1 || 2);
                                    const catX = gapX * (idx + 1) + 140;
                                    const catY = 185;
                                    const isSelected = selectedNode?.name === cat.name;
                                    const isGuessed = !mindmapActiveRecall || mindmapGuessedNodes[cat.name];

                                    return (
                                      <g key={`g-cat-${idx}`}>
                                        {/* Sub-node circle */}
                                        <motion.g 
                                          className="cursor-pointer"
                                          onClick={() => {
                                            setSelectedNode({ name: cat.name, description: cat.description });
                                            if (mindmapActiveRecall && !mindmapGuessedNodes[cat.name]) {
                                              setMindmapGuessedNodes(prev => ({ ...prev, [cat.name]: true }));
                                              confetti({ particleCount: 25, spread: 40, origin: { y: 0.6 } });
                                            }
                                          }}
                                          whileHover={{ scale: 1.15 }}
                                          initial={{ scale: 0, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          transition={{ type: "spring", stiffness: 200, damping: 15, delay: idx * 0.1 }}
                                        >
                                          {/* Pulse Ring when selected */}
                                          {isSelected && (
                                            <motion.circle
                                              cx={catX}
                                              cy={catY}
                                              r="26"
                                              fill="none"
                                              stroke="#eab308"
                                              strokeWidth="1.5"
                                              animate={{ scale: [0.95, 1.25, 0.95], opacity: [0.9, 0.1, 0.9] }}
                                              transition={{ repeat: Infinity, duration: 2.0 }}
                                            />
                                          )}

                                          <circle
                                            cx={catX}
                                            cy={catY}
                                            r="18"
                                            filter="url(#glow-amber)"
                                            className={`transition-all duration-300 fill-amber-950 stroke-3 ${
                                              isSelected 
                                                ? "stroke-yellow-400" 
                                                : "stroke-amber-500/80 hover:stroke-yellow-500"
                                            }`}
                                          />
                                          {/* Emoji inside Category Node */}
                                          <text
                                            x={catX}
                                            y={catY + 4}
                                            textAnchor="middle"
                                            className="text-[10px] pointer-events-none select-none"
                                          >
                                            {idx === 0 ? "📕" : idx === 1 ? "💡" : "🚀"}
                                          </text>

                                          {/* Node Text Label (Guarded by game mode) */}
                                          <text
                                            x={catX}
                                            y={catY - 26}
                                            textAnchor="middle"
                                            className={`font-sans text-[10px] font-bold pointer-events-none select-none ${
                                              isGuessed ? "fill-slate-800 dark:fill-slate-200" : "fill-cyan-500 dark:fill-cyan-400 font-mono italic"
                                            }`}
                                          >
                                            {isGuessed 
                                              ? (cat.name.length > 18 ? `${cat.name.substring(0, 16)}...` : cat.name)
                                              : "??? 🧩"
                                            }
                                          </text>
                                        </motion.g>

                                        {/* DETAIL FACT NODES */}
                                        {(cat.children || []).map((det, detIdx) => {
                                          const numDetails = cat.children?.length || 1;
                                          const detGap = 135 / (numDetails + 1 || 2);
                                          const detX = catX - 65 + detGap * (detIdx + 1);
                                          const detY = 325;
                                          const isDetSelected = selectedNode?.name === det.name;
                                          const isDetGuessed = !mindmapActiveRecall || mindmapGuessedNodes[det.name];

                                          return (
                                            <motion.g 
                                              key={`g-det-${idx}-${detIdx}`}
                                              className="cursor-pointer"
                                              onClick={() => {
                                                setSelectedNode({ name: det.name, description: det.description });
                                                if (mindmapActiveRecall && !mindmapGuessedNodes[det.name]) {
                                                  setMindmapGuessedNodes(prev => ({ ...prev, [det.name]: true }));
                                                  confetti({ particleCount: 15, spread: 30, origin: { y: 0.6 } });
                                                }
                                              }}
                                              whileHover={{ scale: 1.25 }}
                                              initial={{ scale: 0, opacity: 0 }}
                                              animate={{ scale: 1, opacity: 1 }}
                                              transition={{ type: "spring", stiffness: 180, damping: 14, delay: (idx * 0.15) + (detIdx * 0.08) }}
                                            >
                                              {/* Floating orbit path ring if selected */}
                                              {isDetSelected && (
                                                <circle
                                                  cx={detX}
                                                  cy={detY}
                                                  r="17"
                                                  fill="none"
                                                  stroke="#22d3ee"
                                                  strokeWidth="1"
                                                  strokeDasharray="4 2"
                                                  className="animate-spin"
                                                />
                                              )}

                                              <circle
                                                cx={detX}
                                                cy={detY}
                                                r="11"
                                                filter="url(#glow-cyan)"
                                                className={`transition-all duration-300 fill-cyan-950 stroke-[2] ${
                                                  isDetSelected 
                                                    ? "stroke-cyan-400" 
                                                    : "stroke-cyan-600/80 hover:stroke-cyan-400"
                                                }`}
                                              />
                                              <text
                                                cx={detX}
                                                cy={detY}
                                                x={detX}
                                                y={detY + 3.5}
                                                textAnchor="middle"
                                                className="text-[8px] pointer-events-none select-none"
                                              >
                                                ✨
                                              </text>
                                              <text
                                                x={detX}
                                                y={detY + 24}
                                                textAnchor="middle"
                                                className={`font-sans text-[8px] font-semibold pointer-events-none select-none ${
                                                  isDetGuessed ? "fill-slate-500 dark:fill-slate-300" : "fill-cyan-500 font-mono animate-pulse"
                                                }`}
                                              >
                                                {isDetGuessed 
                                                  ? (det.name.length > 15 ? `${det.name.substring(0, 13)}...` : det.name)
                                                  : "???"
                                                }
                                              </text>
                                            </motion.g>
                                          );
                                        })}
                                      </g>
                                    );
                                  })}
                                </g>
                              );
                            })()}
                          </motion.g>
                        </svg>
                      </div>

                      {/* Detail Inspector Sidebar */}
                      <div className="lg:col-span-4 flex flex-col justify-between p-6 rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-[#080d19] bg-white shadow-xl text-left">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-cyan-500 dark:text-cyan-400 font-bold uppercase tracking-widest">
                              {appLanguage === "en" ? "Node Decoder 🔍" : "নোড ডিকোডার 🔍"}
                            </span>
                            
                            {/* Star solver badge for game mode */}
                            {mindmapActiveRecall && (
                              <div className="flex items-center gap-1 text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full font-mono font-bold">
                                <span>⭐ Solve Tracker:</span>
                                <span>{Object.keys(mindmapGuessedNodes).length} Solved</span>
                              </div>
                            )}
                          </div>

                          {selectedNode ? (
                            <motion.div 
                              key={selectedNode.name}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-4 bg-slate-50 dark:bg-[#0b1326] p-4 rounded-xl border border-slate-200/50 dark:border-white/5 relative overflow-hidden"
                            >
                              {/* Background overlay accent */}
                              <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />

                              <div>
                                <span className="text-[8px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/10">
                                  {selectedNode.name === activeGuide.mindmap.name
                                    ? (appLanguage === "en" ? "Primary Core 🪐" : "প্রধান বিষয় 🪐")
                                    : activeGuide.mindmap.children?.some(c => c.name === selectedNode.name)
                                    ? (appLanguage === "en" ? "Sub-Process Category 📚" : "উপ-ক্যাটাগরি 📚")
                                    : (appLanguage === "en" ? "Playful Fact detail 💡" : "খেলার ছলে তথ্য 💡")
                                  }
                                </span>
                                <h4 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight mt-2.5">
                                  {selectedNode.name}
                                </h4>
                              </div>

                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                                {selectedNode.description}
                              </p>

                              {/* Speak node content helper */}
                              <div className="pt-2">
                                <button
                                  onClick={() => speakText(selectedNode.description)}
                                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-400 dark:hover:text-cyan-400 bg-slate-150/70 dark:bg-[#0f1932] border border-slate-200 dark:border-white/5 rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>{appLanguage === "en" ? "Listen Out Loud" : "মুখে শুনুন"}</span>
                                </button>
                              </div>
                            </motion.div>
                          ) : (
                            <div className="py-14 text-center text-slate-400 dark:text-slate-500 text-xs font-sans bg-slate-50/50 dark:bg-[#0b1326]/50 rounded-xl border border-dashed border-slate-200 dark:border-white/5">
                              🧩 {appLanguage === "en" ? "Click any node in the whiteboard to decipher its explanation here!" : "হোয়াইটবোর্ডের যেকোনো নোডে ক্লিক করে তার ব্যাখ্যা এখানে ডিকোড করুন!"}
                            </div>
                          )}
                        </div>

                        {/* Interactive prompt block */}
                        <div className="pt-4 border-t dark:border-white/5 border-slate-200 mt-6 bg-slate-100/50 dark:bg-slate-900/10 p-3.5 rounded-xl">
                          <div className="flex gap-2 items-start">
                            <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-slate-500 leading-normal font-sans">
                              {appLanguage === "en" ? (
                                <span><strong>Whiteboard navigation:</strong> You can drag the map space, change zoom with buttons, or click a node to read and speak. Switch to <strong>Riddle Mode</strong> to test active memory!</span>
                              ) : (
                                <span><strong>হোয়াইটবোর্ড টিপস:</strong> ম্যাপটি টেনে সরাতে পারেন, জুম করতে পারেন বা শুনতে নোডে ক্লিক করতে পারেন। স্মৃতি পরীক্ষা করতে <strong>ধাঁধা গেম</strong> অন করুন!</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* TAB 3: ACTIVE RECALL FLASHCARDS */}
                {activeTab === "flashcards" && (
                  <motion.div
                    key="flashcards"
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -25 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="max-w-xl mx-auto space-y-6"
                  >
                    {(() => {
                      const totalCardsCount = activeGuide.flashcards.length;
                      const masteredCount = Object.values(cardStatus).filter((s) => s === "correct").length;
                      const isAllMastered = totalCardsCount > 0 && masteredCount === totalCardsCount;

                      if (isAllMastered) {
                        return (
                          <motion.div
                            key="flashcard-success"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="p-8 rounded-3xl border border-emerald-500/20 dark:bg-[#0c1a2f] bg-emerald-50/50 dark:border-emerald-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden"
                          >
                            {/* background ambient light */}
                            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl" />
                            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl" />
                            
                            <div className="relative z-10 flex flex-col items-center space-y-4">
                              <div className="w-20 h-20 bg-emerald-500/20 dark:bg-emerald-500/30 text-emerald-400 dark:text-emerald-300 rounded-full flex items-center justify-center border border-emerald-500/40 animate-bounce shadow-lg">
                                <Award className="w-10 h-10" />
                              </div>
                              
                              <div>
                                <span className="text-xs font-mono uppercase tracking-widest text-emerald-500 dark:text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">
                                  {appLanguage === "en" ? "Double-Star Recall Champion! 🏆" : "ডাবল-স্টার রিকল চ্যাম্পিয়ন! 🏆"}
                                </span>
                                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mt-3">
                                  {appLanguage === "en" ? "All Riddles Decoded!" : "সবগুলো ধাঁধার সমাধান হয়েছে!"}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                                  {appLanguage === "en" 
                                    ? `Incredible job! You've successfully completed and fully mastered all ${totalCardsCount} recall riddle cards for this topic.` 
                                    : `অসাধারণ কাজ! তুমি এই বিষয়ের সবগুলো ${totalCardsCount}টি কুইজ কার্ড শেষ করে ফেলেছ এবং জিতেছ।`}
                                </p>
                              </div>

                              {/* Quick Stats Box */}
                              <div className="grid grid-cols-2 gap-4 w-full max-w-sm py-4">
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border dark:border-white/5 border-slate-200">
                                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">{appLanguage === "en" ? "Cards Completed" : "মোট কার্ড শেষ"}</p>
                                  <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{totalCardsCount} / {totalCardsCount}</p>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border dark:border-white/5 border-slate-200">
                                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">{appLanguage === "en" ? "Study Focus" : "পড়ার সময়"}</p>
                                  <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                                    {Math.floor((activeGuide.studySeconds || 0) / 60)}m {(activeGuide.studySeconds || 0) % 60}s
                                  </p>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm justify-center pt-2">
                                <button
                                  onClick={() => {
                                    const totalSecs = activeGuide.studySeconds || 0;
                                    const mins = Math.floor(totalSecs / 60);
                                    const secs = totalSecs % 60;
                                    const shareText = appLanguage === "en" 
                                      ? `🏆 STUDY SUCCESS MILESTONE! 🏆\n------------------------------------------\nApp: Study Buddy 🐻✨\nTopic: ${activeGuide.topicName}\nAchievement: Mastered all ${totalCardsCount} Flashcards! 🃏\nRecall Accuracy: 100% ⭐\nCognitive Focus Time: ${mins}m ${secs}s ⏱️\n------------------------------------------\nShared with teachers & parents with pride! Keep shining! ✨`
                                      : `🏆 পড়ালেখার সফলতার মাইলফলক! 🏆\n------------------------------------------\nঅ্যাপ: ফেইম্যান স্টাডি বাডি 🐻✨\nটপিক: ${activeGuide.topicName}\nঅর্জন: সবগুলো ${totalCardsCount}টি ধাঁধার কার্ড জয় করা হয়েছে! 🃏\nসঠিকতা: ১০০% ⭐\nমনোযোগের সময়: ${mins}ম ${secs}সে ⏱️\n------------------------------------------\nগর্বের সাথে শেয়ার করা হলো! আরও এগিয়ে যাও! ✨`;
                                    
                                    navigator.clipboard.writeText(shareText);
                                    setIsCopied(true);
                                    setTimeout(() => setIsCopied(false), 2500);
                                  }}
                                  className="flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-md hover:scale-[1.02] cursor-pointer min-h-[44px] flex-1"
                                >
                                  <Share2 className="w-4 h-4 shrink-0" />
                                  <span>{isCopied ? (appLanguage === "en" ? "Copied! 👍" : "কপি হয়েছে! 👍") : (appLanguage === "en" ? "Share Achievement" : "সাফল্য শেয়ার করো")}</span>
                                </button>
                                
                                <button
                                  onClick={resetFlashcards}
                                  className="flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition shadow-sm hover:scale-[1.02] cursor-pointer min-h-[44px] flex-1"
                                >
                                  <RotateCcw className="w-4 h-4 shrink-0" />
                                  <span>{appLanguage === "en" ? "Practice Again" : "আবার খেলো"}</span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      }

                      return (
                        <>
                          <div className="text-center">
                            <span className="text-[10px] font-mono bg-yellow-500/10 text-yellow-400 px-2.5 py-1 rounded-full border border-yellow-500/10 font-bold uppercase tracking-widest">
                              {appLanguage === "en" ? "Active Recall Deck" : "অ্যাক্টিভ রিকল ডেক"}
                            </span>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight mt-2">{t.activeRecallPractice}</h3>
                            <p className="text-xs text-slate-500 mt-1">
                              {t.activeRecallPracticeDesc}
                            </p>
                          </div>

                          {/* Progress tracking */}
                          <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                            <span>{t.cardNumber} {currentCardIndex + 1} / {activeGuide.flashcards.length}</span>
                            <button
                              onClick={resetFlashcards}
                              className="flex items-center gap-1 text-[11px] hover:text-emerald-400 text-slate-500 uppercase tracking-wider font-bold"
                            >
                              <RotateCw className="w-3 h-3" /> {t.resetDeck}
                            </button>
                          </div>

                          {/* Flippable Card Container */}
                          <div 
                            className="relative h-[240px] cursor-pointer perspective-1000 select-none group"
                            onClick={() => setIsCardFlipped(!isCardFlipped)}
                            id="flashcard_interactive_box"
                          >
                            <div className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${isCardFlipped ? "rotate-y-180" : ""}`}>
                              
                              {/* Front Side */}
                              <div className="absolute inset-0 w-full h-full p-6 md:p-8 rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-[#080d19] bg-white flex flex-col justify-between shadow-xl backface-hidden text-left">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 dark:text-emerald-400 font-bold">
                                    {t.questionSide}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      speakText(activeGuide.flashcards[currentCardIndex]?.question);
                                    }}
                                    className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center min-h-[40px] min-w-[40px] ${
                                      isSpeaking && spokenText === activeGuide.flashcards[currentCardIndex]?.question
                                        ? "bg-emerald-600 text-white animate-pulse shadow-md"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                    }`}
                                    title="Listen to question"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="flex-1 flex items-center justify-center py-4">
                                  <p className="text-sm md:text-md font-bold text-slate-800 dark:text-white text-center leading-normal">
                                    {activeGuide.flashcards[currentCardIndex]?.question}
                                  </p>
                                </div>
                                <span className="text-[10px] text-center text-slate-500 font-mono">
                                  {t.flipInstruction}
                                </span>
                              </div>

                              {/* Back Side */}
                              <div className="absolute inset-0 w-full h-full p-6 md:p-8 rounded-2xl border dark:border-white/10 border-slate-300 dark:bg-[#0f172a] bg-emerald-50 dark:bg-[#0f172a] flex flex-col justify-between shadow-xl backface-hidden rotate-y-180 text-left">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                                    {t.answerSide}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      speakText(activeGuide.flashcards[currentCardIndex]?.answer);
                                    }}
                                    className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center min-h-[40px] min-w-[40px] ${
                                      isSpeaking && spokenText === activeGuide.flashcards[currentCardIndex]?.answer
                                        ? "bg-emerald-600 text-white animate-pulse shadow-md"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                    }`}
                                    title="Listen to answer"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="flex-1 flex items-center justify-center py-4">
                                  <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 text-center leading-relaxed font-semibold">
                                    {activeGuide.flashcards[currentCardIndex]?.answer}
                                  </p>
                                </div>
                                <span className="text-[10px] text-center text-slate-500 dark:text-slate-400 font-mono">
                                  {t.flipBackInstruction}
                                </span>
                              </div>

                            </div>
                          </div>

                          {/* Answer Quality Logging */}
                          <div className="flex justify-center gap-4">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCardStatus("review"); }}
                              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm min-h-[48px] w-1/2 md:w-auto ${
                                cardStatus[currentCardIndex] === "review"
                                  ? "bg-amber-600 text-white border border-amber-500"
                                  : "bg-slate-200 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border dark:border-white/5 border-slate-300"
                              }`}
                            >
                              ⚠️ {t.stillReviewing}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCardStatus("correct"); }}
                              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm min-h-[48px] w-1/2 md:w-auto ${
                                cardStatus[currentCardIndex] === "correct"
                                  ? "bg-emerald-600 text-white border border-emerald-500"
                                  : "bg-slate-200 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border dark:border-white/5 border-slate-300"
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4 shrink-0" /> {t.memorized}
                            </button>
                          </div>

                          {/* Navigation Buttons */}
                          <div className="flex justify-between items-center pt-4">
                            <button
                              disabled={currentCardIndex === 0}
                              onClick={() => { setIsCardFlipped(false); setCurrentCardIndex((prev) => prev - 1); }}
                              className="px-5 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-500 transition-all text-xs md:text-sm font-bold flex items-center gap-2 cursor-pointer min-h-[44px] bg-slate-100 dark:bg-slate-900 border dark:border-white/5 border-slate-200 shadow-sm"
                            >
                              <ArrowLeft className="w-4 h-4 shrink-0" /> {t.prevCard}
                            </button>
                            <button
                              disabled={currentCardIndex === activeGuide.flashcards.length - 1}
                              onClick={() => { setIsCardFlipped(false); setCurrentCardIndex((prev) => prev + 1); }}
                              className="px-5 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-500 transition-all text-xs md:text-sm font-bold flex items-center gap-2 cursor-pointer min-h-[44px] bg-slate-100 dark:bg-[#131b2e] border dark:border-white/5 border-slate-200 shadow-sm"
                            >
                              {t.nextCard} <ArrowRight className="w-4 h-4 shrink-0" />
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>
                )}

                {/* TAB 4: CONCEPT CLARIFIER CHAT */}
                {activeTab === "clarifier" && (
                  <motion.div
                    key="clarifier"
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -25 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-220px)] border dark:border-white/5 border-slate-200 dark:bg-[#070b14] bg-white rounded-2xl shadow-xl overflow-hidden text-left"
                    id="clarifier_chat_panel"
                  >
                    
                    {/* Chat header info */}
                    <div className="p-4 border-b dark:border-white/5 border-slate-200 dark:bg-[#090f1a] bg-slate-50 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white">{t.activePedagogyClarifier}</h4>
                          <p className="text-[10px] text-slate-500 font-sans">{appLanguage === "en" ? "Strictly Grounded in" : "শুধুমাত্র প্রাসঙ্গিক:"} {activeGuide.topicName}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setChatHistory([{ sender: "ai", text: appLanguage === "en" ? "Ask me anything related to this study guide! What can I make simpler?" : "এই টপিক নিয়ে আমাকে যেকোনো প্রশ্ন করো! আমি তোমাকে সহজ করে বুঝিয়ে দেবো।" }])}
                        className="text-[10px] text-slate-500 hover:text-emerald-400 uppercase font-bold tracking-wider"
                      >
                        {t.clearChat}
                      </button>
                    </div>

                    {/* Chat history list */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {chatHistory.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl p-3 text-xs text-left leading-relaxed font-sans ${
                              msg.sender === "user"
                                ? "bg-emerald-600 text-white font-medium shadow"
                                : "dark:bg-[#0c1221] bg-slate-100 text-slate-800 dark:text-slate-200 border dark:border-white/5 border-slate-200"
                            }`}
                          >
                            <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
                          </div>
                        </div>
                      ))}

                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="dark:bg-[#0c1221] bg-slate-100 text-slate-500 border dark:border-white/5 border-slate-200 rounded-xl p-3 text-xs flex items-center gap-2">
                            <RotateCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                            <span>{t.tutorDrafting}</span>
                          </div>
                        </div>
                      )}
                      
                      <div ref={chatEndRef} />
                    </div>

                    {/* Suggested study queries */}
                    <div className="p-3 border-t dark:border-white/5 border-slate-200 dark:bg-[#090f1a] bg-slate-50/50 shrink-0">
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-2">{appLanguage === "en" ? "Suggested Inquiries:" : "পরামর্শ দেওয়া প্রশ্ন:"}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeGuide.vocabulary && activeGuide.vocabulary.slice(0, 3).map((v) => (
                          <button
                            key={v.term}
                            onClick={() => handleSendChat(appLanguage === "en" ? `Can you explain the significance of ${v.term} using another everyday analogy?` : `আমায় ${v.term} এর তাৎপর্য আরেকটি বাস্তব উদাহরণের সাহায্যে বোঝাতে পারো?`)}
                            className="px-2.5 py-1 text-[10px] font-semibold rounded-md dark:bg-slate-800/60 dark:hover:bg-slate-800 bg-white hover:bg-slate-100 border dark:border-white/5 border-slate-200 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          >
                            {appLanguage === "en" ? `Explain ${v.term} in-depth` : `${v.term} বিস্তারিত বোঝাও`}
                          </button>
                        ))}
                        <button
                          onClick={() => handleSendChat(appLanguage === "en" ? "Create a multiple-choice practice question for me regarding this topic." : "আমার জন্য এই টপিকের উপর একটি কুইজের প্রশ্ন তৈরি করো।")}
                          className="px-2.5 py-1 text-[10px] font-semibold rounded-md dark:bg-slate-800/60 dark:hover:bg-slate-800 bg-white hover:bg-slate-100 border dark:border-white/5 border-slate-200 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          {appLanguage === "en" ? "📝 Practice Quiz" : "📝 অনুশীলন কুইজ"}
                        </button>
                      </div>
                    </div>

                    {/* Chat inputs */}
                    <div className="p-3.5 border-t dark:border-white/5 border-slate-200 dark:bg-[#090f1a] bg-white flex gap-2 items-center shrink-0">
                      <input
                        type="text"
                        placeholder={t.chatPlaceholder}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                        disabled={isChatLoading}
                        className="flex-1 text-xs p-3 rounded-lg border dark:border-white/5 border-slate-300 dark:bg-[#0d1425] bg-slate-50 text-slate-800 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => handleSendChat()}
                        disabled={isChatLoading || !chatInput.trim()}
                        className="p-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-slate-700 transition shadow-md cursor-pointer shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                  </motion.div>
                )}

                {/* TAB 5: PROGRESS ANALYTICS DASHBOARD */}
                
                {/* Voice Chat Tab */}
                {activeTab === "voiceChat" && (
                  <motion.div
                    key="voiceChat"
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -25 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-220px)] border dark:border-white/5 border-slate-200 dark:bg-[#070b14] bg-white rounded-2xl shadow-xl overflow-hidden text-left"
                    id="voice_chat_panel"
                  >
                    {/* Header */}
                    <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 p-4 flex justify-between items-center z-10 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 rounded-xl flex items-center justify-center animate-pulse">
                          <Mic className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                            {appLanguage === "en" ? "Voice Chat Buddy 🎙️" : "ভয়েস চ্যাট বাডি 🎙️"}
                          </h3>
                          <p className="text-[10px] text-slate-500">
                            {appLanguage === "en" 
                              ? "Powered by AI & HuggingFace Models (Kid-Safe)" 
                              : "এআই এবং হাগিংফেস মডেল দ্বারা চালিত (বাচ্চাদের জন্য নিরাপদ)"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setVoiceChatHistory([]);
                          setVoiceChatInput("");
                        }}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {t.clearChat}
                      </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                      {voiceChatHistory.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                          <Mic className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {appLanguage === "en"
                              ? "Hi! I am your Voice Chat Buddy. Click the microphone to start talking to me."
                              : "হ্যালো! আমি তোমার ভয়েস চ্যাট বাডি। আমার সাথে কথা বলতে মাইক্রোফোনে ক্লিক করো।"}
                          </p>
                        </div>
                      ) : (
                        voiceChatHistory.map((msg, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                msg.role === "user"
                                  ? "bg-indigo-600 text-white rounded-br-sm shadow-sm"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-white/5"
                              }`}
                            >
                              {msg.role === "bot" && (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 block mb-1">
                                  Buddy {getMascotEmoji()}
                                </span>
                              )}
                              <p className="text-sm leading-relaxed">{msg.text}</p>
                            </div>
                          </motion.div>
                        ))
                      )}
                      
                      {isVoiceChatting && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl rounded-bl-sm px-4 py-3 border border-slate-200 dark:border-white/5">
                            <div className="flex gap-1.5 items-center h-4">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/5 shrink-0">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleVoiceChatSubmit();
                        }}
                        className="flex items-center gap-2"
                      >
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={`p-3 rounded-full transition-all ${
                            isListening
                              ? "bg-red-500 text-white animate-pulse"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                          }`}
                        >
                          <Mic className="w-5 h-5" />
                        </button>
                        <input
                          type="text"
                          value={voiceChatInput}
                          onChange={(e) => setVoiceChatInput(e.target.value)}
                          placeholder={
                            isListening
                              ? (appLanguage === "en" ? "Listening..." : "শুনছি...")
                              : (appLanguage === "en" ? "Type or click mic to speak..." : "লিখুন অথবা মাইকে ক্লিক করুন...")
                          }
                          className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                          disabled={isVoiceChatting}
                        />
                        <button
                          type="submit"
                          disabled={!voiceChatInput.trim() || isVoiceChatting}
                          className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}

                {activeTab === "dashboard" && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -25 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="max-w-5xl mx-auto space-y-6 text-left animate-fade-in"
                  >
                    <div className="text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/10 font-bold uppercase tracking-widest">
                          D3 / Recharts Analytics Hub
                        </span>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight mt-2.5">Your Study Progress & Retention Dashboard</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Real-time telemetry measuring cognitive focus time, flashcard recall accuracy, and subject coverage.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-md font-mono border border-emerald-500/20 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
                        </span>
                      </div>
                    </div>

                    {/* Bento Box Grid for Stat Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      
                      {/* STAT 1: FOCUS TIME */}
                      {(() => {
                        const totalSecs = guides.reduce((acc, g) => acc + (g.studySeconds || 0), 0);
                        const mins = Math.floor(totalSecs / 60);
                        const secs = totalSecs % 60;
                        return (
                          <div className="p-5 rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-[#080d19] bg-white shadow-md flex items-center gap-4">
                            <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Total Cognitive Focus</p>
                              <p className="text-xl font-bold text-slate-800 dark:text-white font-mono mt-0.5">
                                {mins}m {secs}s
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">Accumulated via Active Recall</p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* STAT 2: CARDS MASTERED */}
                      {(() => {
                        const totalMastered = guides.reduce((acc, g) => acc + (g.cardsMasteredCount || 0), 0);
                        const totalCards = guides.reduce((acc, g) => acc + (g.flashcards?.length || 0), 0);
                        const percent = totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0;
                        return (
                          <div className="p-5 rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-[#080d19] bg-white shadow-md flex items-center gap-4">
                            <div className="p-3.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Flashcards Mastered</p>
                              <p className="text-xl font-bold text-slate-800 dark:text-white font-mono mt-0.5">
                                {totalMastered} / {totalCards}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{percent}% mastery coverage</p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* STAT 3: SUBJECT MATTERS */}
                      {(() => {
                        const allTags = Array.from(new Set(guides.flatMap((g) => g.tags || [])));
                        return (
                          <div className="p-5 rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-[#080d19] bg-white shadow-md flex items-center gap-4">
                            <div className="p-3.5 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                              <Tag className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Subject Coverage</p>
                              <p className="text-xl font-bold text-slate-800 dark:text-white font-mono mt-0.5">
                                {allTags.length} Categories
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{guides.length} active study guides</p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* STAT 4: DAILY STREAK BADGE */}
                      <div className="p-5 rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-[#080d19] bg-white shadow-md flex items-center gap-4 relative overflow-hidden">
                        {streakCount > 0 && (
                          <div className="absolute -top-6 -right-6 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
                        )}
                        <div className={`p-3.5 rounded-xl border ${
                          streakCount > 0 
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                            : "bg-slate-500/10 text-slate-400 border-slate-500/10"
                        }`}>
                          <Flame className={`w-5 h-5 ${streakCount > 0 ? "animate-pulse" : ""}`} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                            {appLanguage === "en" ? "Daily Study Streak" : "প্রতিদিনের স্ট্রীক"}
                          </p>
                          <p className="text-xl font-bold text-slate-800 dark:text-white font-mono mt-0.5">
                            {streakCount} {appLanguage === "en" ? "Days" : "দিন"}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {(() => {
                              const todayStr = new Date().toLocaleDateString("en-CA");
                              if (lastStudyDate === todayStr) {
                                return appLanguage === "en" ? "Completed today! 🔥" : "আজকের পড়া শেষ! 🔥";
                              } else {
                                return appLanguage === "en" 
                                  ? "Focus block pending ⏰" 
                                  : "আজকের কুইজ বাকি ⏰";
                              }
                            })()}
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* ACHIEVEMENTS BADGES */}
                    <div className="p-6 rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-[#080d19] bg-white shadow-md">
                      <div 
                        className="flex justify-between items-center cursor-pointer select-none pb-4 border-b dark:border-white/5 border-slate-100"
                        onClick={() => setIsAchievementsCollapsed(!isAchievementsCollapsed)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                            <Flame className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight font-sans flex items-center gap-2">
                              <span>Achievement Badges</span>
                              <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-mono font-normal normal-case">
                                {isAchievementsCollapsed ? (appLanguage === "en" ? "Show" : "দেখুন") : (appLanguage === "en" ? "Hide" : "লুকান")}
                              </span>
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">Earn badges by completing study milestones.</p>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isAchievementsCollapsed ? "" : "rotate-180 text-amber-500"}`} />
                      </div>

                      <AnimatePresence initial={false}>
                        {!isAchievementsCollapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden pt-4"
                          >

                      {(() => {
                        const totalSecs = guides.reduce((acc, g) => acc + (g.studySeconds || 0), 0);
                        const totalMastered = guides.reduce((acc, g) => acc + (g.cardsMasteredCount || 0), 0);
                        
                        const badges = [
                          { 
                            id: "first_step", 
                            name: "First Step", 
                            desc: "Created your first study guide", 
                            icon: "🌟", 
                            unlocked: guides.length >= 1 
                          },
                          { 
                            id: "explorer", 
                            name: "Explorer", 
                            desc: "Created 5 study guides", 
                            icon: "🧭", 
                            unlocked: guides.length >= 5 
                          },
                          { 
                            id: "focus_master", 
                            name: "Focus Master", 
                            desc: "30 minutes of focus time", 
                            icon: "⏳", 
                            unlocked: totalSecs >= 1800 
                          },
                          { 
                            id: "flashcard_whiz", 
                            name: "Flashcard Whiz", 
                            desc: "Mastered 10 flashcards", 
                            icon: "🧠", 
                            unlocked: totalMastered >= 10 
                          },
                          { 
                            id: "streak_master", 
                            name: "Streak Master", 
                            desc: "3 day study streak", 
                            icon: "🔥", 
                            unlocked: streakCount >= 3 
                          },
                          { 
                            id: "quiz_legend", 
                            name: "Quiz Legend", 
                            desc: "50 cards mastered", 
                            icon: "👑", 
                            unlocked: totalMastered >= 50 
                          }
                        ];

                        return (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {badges.map((badge) => (
                              <div 
                                key={badge.id}
                                className={`flex flex-col items-center text-center p-4 rounded-xl border ${
                                  badge.unlocked 
                                    ? "bg-emerald-500/10 border-emerald-500/20 shadow-sm" 
                                    : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 opacity-60 grayscale"
                                }`}
                              >
                                <div className={`text-3xl mb-2 ${badge.unlocked ? "animate-bounce" : ""}`}>
                                  {badge.icon}
                                </div>
                                <h5 className={`text-xs font-bold ${badge.unlocked ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500"}`}>
                                  {badge.name}
                                </h5>
                                <p className="text-[9px] text-slate-500 mt-1 leading-tight">{badge.desc}</p>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Chart Visualizations Section */}
                    <div className="space-y-4">
                      <div 
                        className="flex justify-between items-center cursor-pointer select-none pb-2 border-b dark:border-white/5 border-slate-100 mt-2"
                        onClick={() => setIsChartsCollapsed(!isChartsCollapsed)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
                            <span>📈 Cognitive Analytics & Charts</span>
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-mono font-normal normal-case">
                              {isChartsCollapsed ? (appLanguage === "en" ? "Show" : "দেখুন") : (appLanguage === "en" ? "Hide" : "লুকান")}
                            </span>
                          </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isChartsCollapsed ? "" : "rotate-180 text-emerald-400"}`} />
                      </div>

                      <AnimatePresence initial={false}>
                        {!isChartsCollapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                      
                      {/* BAR CHART: Study minutes & retention progress */}
                      <div className="lg:col-span-8 p-6 rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-[#080d19] bg-white shadow-md flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight">Focus Minutes & Memorization Comparison</h4>
                          <p className="text-[11px] text-slate-500 font-sans mt-0.5">Visualizes study time and total flashcards mastered side-by-side per study guide set.</p>
                        </div>

                        <div className="h-64 mt-6">
                          {(() => {
                            const data = guides.map((g) => ({
                              topic: g.topicName.length > 14 ? `${g.topicName.substring(0, 11)}...` : g.topicName,
                              "Focus Minutes": Number(((g.studySeconds || 0) / 60).toFixed(1)),
                              "Cards Mastered": g.cardsMasteredCount || 0,
                            }));

                            if (data.length === 0) {
                              return (
                                <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                                  No data points found to graph. Select a guide to begin ticking focus blocks.
                                </div>
                              );
                            }

                            return (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                                  <XAxis dataKey="topic" tick={{ fill: '#888888', fontSize: 10 }} />
                                  <YAxis tick={{ fill: '#888888', fontSize: 10 }} />
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: '#0c1221', 
                                      borderColor: 'rgba(255,255,255,0.08)',
                                      borderRadius: '8px',
                                      fontSize: '11px'
                                    }} 
                                  />
                                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                                  <Bar dataKey="Focus Minutes" fill="#10b981" radius={[4, 4, 0, 0]} />
                                  <Bar dataKey="Cards Mastered" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            );
                          })()}
                        </div>
                      </div>

                      {/* PIE CHART / LIST: Tag-wise Category Distribution */}
                      <div className="lg:col-span-4 p-6 rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-[#080d19] bg-white shadow-md flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight font-sans">Tag Allocations</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">Proportional coverage breakdown across tags.</p>
                        </div>

                        {/* Pie Chart / Distribution bar render */}
                        <div className="flex-1 flex flex-col justify-center space-y-4 mt-6">
                          {(() => {
                            const tagMap: Record<string, number> = {};
                            guides.forEach((g) => {
                              const tg = g.tags || ["General"];
                              tg.forEach((t) => {
                                tagMap[t] = (tagMap[t] || 0) + 1;
                              });
                            });

                            const tagsArray = Object.entries(tagMap).sort((a, b) => b[1] - a[1]);
                            const maxVal = tagsArray.length > 0 ? tagsArray[0][1] : 1;

                            if (tagsArray.length === 0) {
                              return (
                                <div className="py-12 text-center text-xs text-slate-500 font-sans">
                                  No categories added yet. Add a tag under any guide title above to see allocations.
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-3.5 pr-2">
                                {tagsArray.map(([tagName, count]) => {
                                  const percentage = Math.round((count / guides.length) * 100);
                                  return (
                                    <div key={tagName} className="space-y-1 text-left" id={`tag_coverage_${tagName}`}>
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                          {tagName}
                                        </span>
                                        <span className="text-slate-500 font-mono">{count} {count === 1 ? "guide" : "guides"} ({percentage})</span>
                                      </div>
                                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border dark:border-white/5 border-slate-200">
                                        <div 
                                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                                          style={{ width: `${Math.min(100, (count / maxVal) * 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                        
                        <div className="pt-4 border-t dark:border-white/5 border-slate-200 mt-4 bg-slate-100/50 dark:bg-slate-900/10 p-3 rounded-xl text-[10px] text-slate-500 leading-normal flex gap-1.5 items-start">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Tip: Categorize your study sets with custom tags under the viewport heading to organize dynamic focus intervals correctly.</span>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

                {activeTab === "parents" && (
                  <motion.div
                    key="parents"
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -25 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="max-w-4xl mx-auto space-y-6 text-left animate-fade-in"
                  >
                    {/* Parent header banner */}
                    <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/20 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono bg-pink-500/20 text-pink-600 dark:text-pink-400 px-3 py-1 rounded-full border border-pink-500/20 font-bold uppercase tracking-wider">
                            {t.parentsCorner} 👨‍👩‍👧
                          </span>
                          <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{appLanguage === "en" ? "Parent's Control & Buddy Upgrades" : "অভিভাবক নিয়ন্ত্রণ ও প্রিমিয়াম আপগ্রেড"}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t.parentsCornerSub}
                          </p>
                        </div>
                        
                        <div className="shrink-0">
                          {isPremium ? (
                            <div className="flex items-center gap-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-4 py-2.5 rounded-2xl font-black text-sm shadow-md animate-bounce">
                              <span>🌟 STAR PRO ACTIVE 👑</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setIsPremium(true);
                                try {
                                  confetti({
                                    particleCount: 120,
                                    spread: 70,
                                    origin: { y: 0.6 }
                                  });
                                } catch(e){}
                              }}
                              className="px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                            >
                              <span>👑 {appLanguage === "en" ? "Go Premium" : "প্রিমিয়াম হোন"}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Sub-card 1: Study goals & Parent reward */}
                      <div className="p-6 rounded-3xl border dark:border-white/5 border-slate-200 dark:bg-[#080d19] bg-white shadow-xl space-y-5">
                        <div className="flex items-center gap-3 border-b dark:border-white/5 border-slate-100 pb-3">
                          <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/25 text-pink-500 text-lg font-bold">🎯</div>
                          <div>
                            <h4 className="font-extrabold text-slate-800 dark:text-white text-md">{appLanguage === "en" ? "Study Goal & Incentive" : "পড়ার লক্ষ্য ও উপহার"}</h4>
                            <p className="text-[11px] text-slate-500">{appLanguage === "en" ? "Set custom targets & rewards" : "বাচ্চার জন্য লক্ষ্য ও উপহার সেট করুন"}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-700 dark:text-slate-300">{appLanguage === "en" ? "Weekly Target Playtime:" : "সাপ্তাহিক লক্ষ্য সময়:"}</span>
                              <span className="font-mono font-black text-pink-500 text-sm bg-pink-500/10 px-2 py-0.5 rounded-lg">{parentGoalTime} {appLanguage === "en" ? "mins" : "মিনিট"}</span>
                            </div>
                            <input
                              type="range"
                              min="5"
                              max="120"
                              step="5"
                              value={parentGoalTime}
                              onChange={(e) => setParentGoalTime(parseInt(e.target.value))}
                              className="w-full accent-pink-500 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">{appLanguage === "en" ? "Custom Incentive Reward:" : "বাচ্চার জন্য পুরস্কারের ঘোষণা:"}</label>
                            <input
                              type="text"
                              value={parentRewardMsg}
                              onChange={(e) => setParentRewardMsg(e.target.value)}
                              placeholder="e.g. Delicious pizza party! 🍕"
                              className="w-full text-xs p-3 rounded-xl border dark:border-white/5 border-slate-200 dark:bg-[#0d1425] bg-white text-slate-800 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-pink-500 font-sans"
                            />
                          </div>

                          {/* Progress toward reward */}
                          {(() => {
                            const totalSecs = guides.reduce((acc, g) => acc + (g.studySeconds || 0), 0);
                            const currentMins = parseFloat((totalSecs / 60).toFixed(1));
                            const percent = Math.min(100, Math.round((currentMins / parentGoalTime) * 100));
                            
                            return (
                              <div className="pt-3 border-t dark:border-white/5 border-slate-100 space-y-2">
                                <div className="flex justify-between items-center text-[11px] font-bold">
                                  <span className="text-slate-500">{appLanguage === "en" ? "Current Reward Progress:" : "পুরস্কারের অগ্রগতি:"}</span>
                                  <span className="text-pink-500">{currentMins} / {parentGoalTime} mins ({percent}%)</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border dark:border-white/5 border-slate-200">
                                  <div 
                                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                {percent >= 100 ? (
                                  <div className="p-2.5 bg-green-500/15 border border-green-500/20 text-green-600 dark:text-green-400 text-xs rounded-xl font-bold text-center animate-pulse">
                                    🎉 {appLanguage === "en" ? `Goal Reached! Award unlocked: ${parentRewardMsg}` : `লক্ষ্য পূরণ হয়েছে! আনলক হওয়া পুরস্কার: ${parentRewardMsg}`}
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-slate-500 text-left">
                                    {appLanguage === "en" ? `Study ${Math.max(0, parseFloat((parentGoalTime - currentMins).toFixed(1)))} more minutes to earn the reward!` : `পুরস্কারটি জিততে আরও ${Math.max(0, parseFloat((parentGoalTime - currentMins).toFixed(1)))} মিনিট পড়তে হবে!`}
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Sub-card 2: AI mascot text speaking custom note */}
                      <div className="p-6 rounded-3xl border dark:border-white/5 border-slate-200 dark:bg-[#080d19] bg-white shadow-xl space-y-5">
                        <div className="flex items-center gap-3 border-b dark:border-white/5 border-slate-100 pb-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/25 text-purple-500 text-lg font-bold">💬</div>
                          <div>
                            <h4 className="font-extrabold text-slate-800 dark:text-white text-md">{appLanguage === "en" ? "Custom Note Reader" : "অভিভাবকের বিশেষ বার্তা"}</h4>
                            <p className="text-[11px] text-slate-500">{appLanguage === "en" ? "Let the mascot speak your message aloud" : "বাডি আপনার বার্তাটি বাচ্চাকে মুখে পড়ে শোনাবে"}</p>
                          </div>
                        </div>

                        <div className="space-y-3.5">
                          <textarea
                            rows={3}
                            value={parentNoteToChild}
                            onChange={(e) => setParentNoteToChild(e.target.value)}
                            placeholder={appLanguage === "en" ? "Type a sweet message for your child. Your AI Study Buddy will read it in their chosen voice character!" : "বাচ্চার জন্য একটি মিষ্টি বার্তা লিখুন। এআই স্টাডি বাডি তার নিজের কণ্ঠে এটি বাচ্চাকে পড়ে শোনাবে!"}
                            className="w-full text-xs p-3 rounded-xl border dark:border-white/5 border-slate-200 dark:bg-[#0d1425] bg-white text-slate-800 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans resize-none"
                          />

                          <button
                            type="button"
                            onClick={() => speakText(parentNoteToChild || (appLanguage === "en" ? "Great job, little buddy! Keep up the amazing work!" : "দারুণ করছ সোনা! এভাবেই মনোযোগ দিয়ে পড়াশোনা করো!"))}
                            disabled={!parentNoteToChild.trim()}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                          >
                            <Volume2 className="w-4 h-4" />
                            <span>{appLanguage === "en" ? "Read Note Aloud 🔊" : "বার্তাটি মুখে শোনাও 🔊"}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                      {/* Universal AI API Configuration Card */}
                      <div className="p-6 rounded-3xl border dark:border-white/5 border-slate-200 dark:bg-[#080d19] bg-white shadow-xl space-y-5">
                        <div className="flex items-center gap-3 border-b dark:border-white/5 border-slate-100 pb-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/25 text-indigo-500 text-lg font-bold">⚙️</div>
                          <div>
                            <h4 className="font-extrabold text-slate-800 dark:text-white text-md">Universal AI API Routing</h4>
                            <p className="text-[11px] text-slate-500">Route your AI study requests through any operator or local model</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1.5 text-left">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">AI API Operator / Provider:</label>
                            <select
                              value={apiOperator}
                              onChange={(e) => handleSetApiOperator(e.target.value as any)}
                              className="w-full text-xs p-3 rounded-xl border dark:border-white/5 border-slate-200 dark:bg-[#0d1425] bg-white text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                            >
                              <option value="gemini">Google Gemini (Built-in Server-Side API Key)</option>
                              <option value="openai">OpenAI (Requires Server Proxy)</option>
                              <option value="custom">Custom Endpoint (Ollama / OpenRouter / Local LLM)</option>
                            </select>
                          </div>

                          <div className="space-y-1.5 text-left">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Target AI Model Name:</label>
                            <input
                              type="text"
                              value={apiModel}
                              onChange={(e) => handleSetApiModel(e.target.value)}
                              placeholder="e.g. gemini-3.5-flash, gpt-4o, llama3"
                              className="w-full text-xs p-3 rounded-xl border dark:border-white/5 border-slate-200 dark:bg-[#0d1425] bg-white text-slate-800 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                            />
                            <p className="text-[9px] text-slate-500">Specify the model name to request from your chosen operator endpoint.</p>
                          </div>

                          {apiOperator === "custom" && (
                            <div className="space-y-1.5 text-left">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Custom URL Endpoint:</label>
                              <input
                                type="text"
                                value={apiCustomUrl}
                                onChange={(e) => handleSetApiCustomUrl(e.target.value)}
                                placeholder="e.g. http://localhost:11434/v1"
                                className="w-full text-xs p-3 rounded-xl border dark:border-white/5 border-slate-200 dark:bg-[#0d1425] bg-white text-slate-800 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                              />
                              <p className="text-[9px] text-slate-500">Provide the full base API endpoint URL of your custom server or Ollama proxy.</p>
                            </div>
                          )}

                          <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-[10px] text-indigo-600 dark:text-indigo-400 leading-relaxed font-sans text-left">
                            <strong>Universal Routing Active:</strong> Settings are saved automatically in your browser&apos;s LocalStorage and will proxy safely through server routes to prevent client key leaks.
                          </div>
                        </div>
                      </div>

                    {/* Cute animal avatar selector */}
                    <div className="p-6 rounded-3xl border dark:border-white/5 border-slate-200 dark:bg-[#080d19] bg-white shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b dark:border-white/5 border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/25 text-amber-500 text-lg font-bold">🐻</div>
                          <div>
                            <h4 className="font-extrabold text-slate-800 dark:text-white text-md">{appLanguage === "en" ? "Choose Mascot Partner" : "স্টাডি পার্টনার বাডি বাছুন"}</h4>
                            <p className="text-[11px] text-slate-500">{appLanguage === "en" ? "Change your interactive companion character" : "আপনার বাচ্চার পছন্দের চরিত্রটি সিলেক্ট করুন"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 pt-2">
                        {([
                          { id: "bear", label: appLanguage === "en" ? "Barnaby Bear" : "বার্নাবি ভাল্লুক", emoji: "🐻", color: "border-amber-500 bg-amber-500/5", premium: false },
                          { id: "bunny", label: appLanguage === "en" ? "Blossom Bunny" : "ব্লসম খরগোশ", emoji: "🐰", color: "border-pink-500 bg-pink-500/5", premium: false },
                          { id: "dino", label: appLanguage === "en" ? "Dexter Dino" : "ডেক্সটার ডাইনো", emoji: "🦖", color: "border-emerald-500 bg-emerald-500/5", premium: true },
                          { id: "unicorn", label: appLanguage === "en" ? "Unicorn" : "ইউনিকর্ন", emoji: "🦄", color: "border-purple-500 bg-purple-500/5", premium: true },
                          { id: "panda", label: appLanguage === "en" ? "Pip Panda" : "পিপ পান্ডা", emoji: "🐼", color: "border-slate-500 bg-slate-500/5", premium: true }
                        ] as const).map((avatar) => {
                          const isSelected = kidAvatar === avatar.id;
                          const locked = avatar.premium && !isPremium;

                          return (
                            <button
                              key={avatar.id}
                              type="button"
                              onClick={() => {
                                if (locked) {
                                  alert(appLanguage === "en" ? "Unlock Dexter, Unicorn and Panda with Super Kid Premium! 👑" : "ডাইনো, ইউনিকর্ন ও পান্ডা বাডি পেতে সুপার কিড প্রিমিয়াম মেম্বার হোন! 👑");
                                  return;
                                }
                                setKidAvatar(avatar.id);
                              }}
                              className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-2 cursor-pointer transition-all min-h-[100px] ${
                                isSelected 
                                  ? `${avatar.color} ring-2 ring-indigo-500 scale-[1.03] shadow-md` 
                                  : "border-slate-200 dark:border-white/5 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/30"
                              } relative`}
                            >
                              <span className="text-4xl">{avatar.emoji}</span>
                              <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{avatar.label}</span>
                              {locked && (
                                <div className="absolute top-1.5 right-1.5 bg-amber-500 text-white rounded-full p-1 text-[8px] font-bold shadow-md">
                                  👑
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* SaaS monetization / Pricing Simulation table */}
                    {!isPremium && (
                      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-900/40 via-[#0e162b] to-slate-900 border border-indigo-500/30 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="space-y-2 max-w-lg mx-auto">
                          <h4 className="text-xl font-black tracking-tight">{t.premiumUpgrade}</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {t.unlockPremiumText}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
                          <div className="p-4 rounded-2xl bg-[#141d33] border border-white/5 text-left flex items-start gap-3">
                            <span className="text-xl">🎨</span>
                            <div>
                              <h5 className="text-xs font-bold text-slate-200">{appLanguage === "en" ? "Premium Avatars" : "সব প্রিমিয়াম বাডি"}</h5>
                              <p className="text-[10px] text-slate-400 mt-0.5">{appLanguage === "en" ? "Unlock Dino, Unicorn & Panda companion characters" : "ডাইনোসর, ইউনিকর্ন এবং কিউট পান্ডা থিম সিলেক্ট করুন"}</p>
                            </div>
                          </div>
                          <div className="p-4 rounded-2xl bg-[#141d33] border border-white/5 text-left flex items-start gap-3">
                            <span className="text-xl">🔊</span>
                            <div>
                              <h5 className="text-xs font-bold text-slate-200">{appLanguage === "en" ? "Dino & Magical Voices" : "ডাইনোসর ও রোবট ভয়েস"}</h5>
                              <p className="text-[10px] text-slate-400 mt-0.5">{appLanguage === "en" ? "Custom sound pitches & friendly reading speeds" : "জাদুকরী কার্টুন পিচ ও পড়ার আকর্ষণীয় স্পিড"}</p>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setIsPremium(true);
                            try {
                              confetti({
                                particleCount: 150,
                                spread: 80,
                                origin: { y: 0.6 }
                              });
                            } catch(e){}
                          }}
                          className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
                        >
                          <span>👑 {t.becomeProBtn}</span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <BookOpen className="w-12 h-12 text-slate-600 animate-pulse-slow mb-4" />
            <h3 className="text-md font-bold text-slate-800 dark:text-white">No active study guide</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Select an existing study guide from the library or input a new topic in the sidebar to deconstruct it instantly.
            </p>
          </div>
        )}

      </main>

      {/* Did You Know Modal */}
      <AnimatePresence>
        {showDidYouKnow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#0c1221] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowDidYouKnow(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mb-2">
                  <Lightbulb className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                  {appLanguage === "en" ? "Did You Know? 🤯" : "তুমি কি জানো? 🤯"}
                </h3>
                <div className="text-sm text-slate-600 dark:text-slate-300 min-h-[60px] flex items-center justify-center">
                  {isFetchingFact ? (
                    <div className="flex flex-col items-center gap-2">
                      <RotateCw className="w-5 h-5 animate-spin text-amber-500" />
                      <span className="text-xs text-slate-500 font-mono">Fetching fact...</span>
                    </div>
                  ) : (
                    <p className="font-semibold leading-relaxed">{didYouKnowFact}</p>
                  )}
                </div>
                <button
                  onClick={() => setShowDidYouKnow(false)}
                  className="w-full py-3 mt-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-md transition-transform active:scale-95"
                >
                  {appLanguage === "en" ? "Awesome!" : "দারুণ!"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <GeminiAssistant activeGuide={activeGuide} appLanguage={appLanguage} />
    </div>
  );
}
