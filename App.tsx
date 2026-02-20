
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { sendAlimTalk } from './services/solapiService';
import { sendTicketsToSheet } from './services/googleSheetService';
import { searchCustomersByName, getCustomerCount, CustomerDBEntry, uploadExcelToServer } from './services/customerDbService';
import { SOLAPI_CONFIG } from './constants';
import { 
  Clipboard, 
  User, 
  Phone, 
  Box, 
  Barcode, 
  CheckCircle, 
  Loader2, 
  Plus,
  MessageSquare,
  MonitorSmartphone, 
  X, 
  ArrowRight, 
  Trash2, 
  Layers, 
  AlertCircle, 
  Edit3, 
  RefreshCw, 
  FileText, 
  HelpCircle, 
  Check, 
  Clock, 
  Zap, 
  Power, 
  Archive, 
  Calendar, 
  AlertTriangle, 
  MapPin, 
  CalendarDays, 
  Truck, 
  Search, 
  Inbox, 
  Wrench, 
  History, 
  Send, 
  MoreVertical, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Bike, 
  ShoppingBag, 
  CheckSquare, 
  Square, 
  Lock, 
  Unlock, 
  Package, 
  ChevronRight, 
  Star, 
  ClipboardList, 
  Filter,
  Sun,
  Moon,
  FileSpreadsheet,
  UploadCloud,
  Database,
  Server // 서버 아이콘 추가
} from 'lucide-react';

// --- CONSTANTS ---
const ADMIN_PASSWORD = "1234"; // 삭제를 위한 관리자 비밀번호
const GOOGLE_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwiJKX7F1mEphyV0vI3lXa9A1n-qEl1bpZWuyF70Gr6AklBl7fpoDSQLm5OBGlM0E6uew/exec";

const PRODUCT_LIST = [
  "3G-SDI SFP Optical Module",
  "6G-SDI SFP Optical Module",
  "ATEM 1 M/E Advanced Panel 10",
  "ATEM 1 M/E Advanced Panel 20",
  "ATEM 1 M/E Advanced Panel 30",
  "ATEM 1 M/E Broadcast Panel",
  "ATEM 1 M/E Constellation 4K",
  "ATEM 1 M/E Constellation HD",
  "ATEM 1 M/E Production Studio 4K",
  "ATEM 2 M/E Advanced Panel 20",
  "ATEM 2 M/E Advanced Panel 30",
  "ATEM 2 M/E Advanced Panel 40",
  "ATEM 2 M/E Broadcast Panel",
  "ATEM 2 M/E Broadcast Studio 4K",
  "ATEM 2 M/E Constellation 4K",
  "ATEM 2 M/E Constellation HD",
  "ATEM 2 M/E Production Studio 4K",
  "ATEM 4 M/E Advanced Panel 40",
  "ATEM 4 M/E Broadcast Studio 4K",
  "ATEM 4 M/E Constellation 4K",
  "ATEM 4 M/E Constellation 4K Plus",
  "ATEM 4 M/E Constellation HD",
  "ATEM Camera Control Panel",
  "ATEM Camera Converter",
  "ATEM Constellation 8K",
  "ATEM Micro Camera Panel",
  "ATEM Micro Panel",
  "ATEM Microphone Converter",
  "ATEM Mini",
  "ATEM Mini Extreme",
  "ATEM Mini Extreme ISO",
  "ATEM Mini Extreme ISO G2",
  "ATEM Mini Pro",
  "ATEM Mini Pro ISO",
  "ATEM Panel - 10 Input Module",
  "ATEM Panel - Ethernet Module",
  "ATEM Panel - Fan",
  "ATEM Panel - Input LCD Double",
  "ATEM Panel - Input LCD Single",
  "ATEM Panel - joystick",
  "ATEM Panel - Keypad Module",
  "ATEM Panel - Knob Set",
  "ATEM Panel - System Control LCD",
  "ATEM Panel - System Control Module",
  "ATEM Panel - T‑Bar",
  "ATEM Panel - Transition ME1 Module",
  "ATEM Panel - Transition ME2+ Module",
  "ATEM Production Studio 4K",
  "ATEM SDI",
  "ATEM SDI Extreme ISO",
  "ATEM SDI Pro ISO",
  "ATEM Streaming Bridge",
  "ATEM Studio Converter",
  "ATEM Talkback Converter 4K",
  "ATEM Television Studio",
  "ATEM Television Studio 4K8",
  "ATEM Television Studio HD",
  "ATEM Television Studio HD8",
  "ATEM Television Studio HD8 ISO",
  "ATEM Television Studio Pro 4K",
  "ATEM Television Studio Pro HD",
  "Battery Converter HDMI to SDI",
  "Battery Converter SDI to HDMI",
  "Blackmagic 2110 IP Converter 3x3G",
  "Blackmagic 2110 IP Converter 4x12G PWR",
  "Blackmagic 2110 IP Converter 8x12G SFP",
  "Blackmagic 2110 IP Mini BiDirect 12G",
  "Blackmagic 2110 IP Mini BiDirect 12G SFP",
  "Blackmagic 2110 IP Mini IP to HDMI",
  "Blackmagic 2110 IP Mini IP to HDMI SFP",
  "Blackmagic 2110 IP Presentation Converter",
  "Blackmagic 2110 IP SDI to HDMI 12G",
  "Blackmagic 2110 IP SDI to HDMI 12G-10",
  "Blackmagic 2110 IP UpDownCross 12G",
  "Blackmagic 3G SDI Shield for Arduino",
  "Blackmagic 58mm Lens Cap",
  "Blackmagic 77mm Lens Cap",
  "Blackmagic 82mm Lens Cap",
  "Blackmagic Audio Monitor",
  "Blackmagic Audio Monitor 12G",
  "Blackmagic Audio Monitor 12G G3",
  "Blackmagic Camera Fiber Converter",
  "Blackmagic Camera for iOS",
  "Blackmagic Camera ProDock",
  "Blackmagic Cinema Camera 6K",
  "Blackmagic Cinema Camera EF",
  "Blackmagic Cinema Camera MFT",
  "Blackmagic Cinema Camera PL",
  "Blackmagic Cloud",
  "Blackmagic Cloud Backup 8",
  "Blackmagic Cloud Dock 2",
  "Blackmagic Cloud Dock 4",
  "Blackmagic Cloud Pod",
  "Blackmagic Cloud Store 20TB",
  "Blackmagic Cloud Store 320TB",
  "Blackmagic Cloud Store 80TB",
  "Blackmagic Cloud Store Max 24TB",
  "Blackmagic Cloud Store Max 48TB",
  "Blackmagic Cloud Store Mini 16TB",
  "Blackmagic Cloud Store Mini 8TB",
  "Blackmagic Duplicator 4K",
  "Blackmagic eGPU",
  "Blackmagic eGPU Pro",
  "Blackmagic Ethernet Switch 360P",
  "Blackmagic Focus Demand",
  "Blackmagic HDD Case 10 Pack",
  "Blackmagic Media Dock",
  "Blackmagic Media Module 16TB",
  "Blackmagic Media Module 8TB",
  "Blackmagic Media Module CF",
  "Blackmagic Media Player 10G",
  "Blackmagic Micro Cinema Camera",
  "Blackmagic Micro Studio Camera 4K",
  "Blackmagic Micro Studio Camera 4K G2",
  "Blackmagic MultiDock",
  "Blackmagic MultiDock 10G",
  "Blackmagic MultiView 16",
  "Blackmagic MultiView 4",
  "Blackmagic MultiView 4 HD",
  "Blackmagic PCI Express Cable Kit",
  "Blackmagic PL Shim",
  "Blackmagic Pocket Camera Battery Grip",
  "Blackmagic Pocket Camera Battery Pro Grip",
  "Blackmagic Pocket Camera DC Cable Pack",
  "Blackmagic Pocket Cinema Camera",
  "Blackmagic Pocket Cinema Camera 4K",
  "Blackmagic Pocket Cinema Camera 6K",
  "Blackmagic Pocket Cinema Camera 6K G2",
  "Blackmagic Pocket Cinema Camera 6K Pro",
  "Blackmagic Pocket Cinema Camera Power Supply",
  "Blackmagic Pocket Cinema Camera Pro EVF",
  "Blackmagic Production Camera 4K EF",
  "Blackmagic Production Camera 4K PL",
  "Blackmagic PYXIS 12K",
  "Blackmagic PYXIS 12K EF",
  "Blackmagic PYXIS 12K PL",
  "Blackmagic PYXIS 6K",
  "Blackmagic PYXIS 6K EF",
  "Blackmagic PYXIS 6K PL",
  "Blackmagic PYXIS Monitor",
  "Blackmagic PYXIS Monitor EVF Kit",
  "Blackmagic PYXIS Monitor Kit",
  "Blackmagic PYXIS Pro Grip",
  "Blackmagic PYXIS Pro Handle",
  "Blackmagic PYXIS Rosette Plate",
  "Blackmagic RAW",
  "Blackmagic SSD Case 12 Pack",
  "Blackmagic Streaming Decoder 4K",
  "Blackmagic Streaming Encoder 4K",
  "Blackmagic Studio Camera",
  "Blackmagic Studio Camera 4K",
  "Blackmagic Studio Camera 4K Plus",
  "Blackmagic Studio Camera 4K Plus G2",
  "Blackmagic Studio Camera 4K Pro",
  "Blackmagic Studio Camera 4K Pro G2",
  "Blackmagic Studio Camera 6K Pro",
  "Blackmagic Studio Converter",
  "Blackmagic Studio Fiber Converter",
  "Blackmagic Studio Fiber Rack Kit",
  "Blackmagic UltraScope",
  "Blackmagic Universal Rack Shelf",
  "Blackmagic URSA Broadcast",
  "Blackmagic URSA Broadcast ENG Kit",
  "Blackmagic URSA Broadcast G2",
  "Blackmagic URSA Cine - Rubber Caps",
  "Blackmagic URSA Cine - Sunshade",
  "Blackmagic URSA Cine - WiFi Antennas",
  "Blackmagic URSA Cine 12K LF",
  "Blackmagic URSA Cine 12K LF + EVF",
  "Blackmagic URSA Cine 12K LF Body",
  "Blackmagic URSA Cine 17K 65",
  "Blackmagic URSA Cine 17K 65 + EVF",
  "Blackmagic URSA Cine 17K 65 Body",
  "Blackmagic URSA Cine 24V 250W",
  "Blackmagic URSA Cine Baseplate 15",
  "Blackmagic URSA Cine Baseplate 19",
  "Blackmagic URSA Cine Battery Plate B Mount",
  "Blackmagic URSA Cine Battery Plate Gold",
  "Blackmagic URSA Cine Battery Plate VLock",
  "Blackmagic URSA Cine EVF",
  "Blackmagic URSA Cine EVF - Cable USB Set",
  "Blackmagic URSA Cine EVF - Chamois",
  "Blackmagic URSA Cine EVF - Rubber Eyecup",
  "Blackmagic URSA Cine EVF Extension",
  "Blackmagic URSA Cine Grips",
  "Blackmagic URSA Cine Handle",
  "Blackmagic URSA Cine Immersive",
  "Blackmagic URSA Cine Mount EF",
  "Blackmagic URSA Cine Mount LPL",
  "Blackmagic URSA Cine Mount PL",
  "Blackmagic URSA Cine Mount Shims",
  "Blackmagic URSA Cine Rosette",
  "Blackmagic URSA EF",
  "Blackmagic URSA Gold Battery Plate",
  "Blackmagic URSA Handgrip",
  "Blackmagic URSA Mini 4.6K EF",
  "Blackmagic URSA Mini 4.6K PL",
  "Blackmagic URSA Mini 4K EF",
  "Blackmagic URSA Mini 4K PL",
  "Blackmagic URSA Mini B4 Mount",
  "Blackmagic URSA Mini Mic Mount",
  "Blackmagic URSA Mini Pro",
  "Blackmagic URSA Mini Pro 12K",
  "Blackmagic URSA Mini Pro 12K OLPF",
  "Blackmagic URSA Mini Pro 4.6K G2",
  "Blackmagic URSA Mini Pro B4 Mount",
  "Blackmagic URSA Mini Pro EF Mount",
  "Blackmagic URSA Mini Pro F Mount",
  "Blackmagic URSA Mini Pro PL Mount",
  "Blackmagic URSA Mini Pro Shim Kit",
  "Blackmagic URSA Mini Recorder",
  "Blackmagic URSA Mini Shoulder Kit",
  "Blackmagic URSA Mini SSD Recorder",
  "Blackmagic URSA PL",
  "Blackmagic URSA Shoulder Kit",
  "Blackmagic URSA Studio Viewfinder",
  "Blackmagic URSA Studio Viewfinder G2",
  "Blackmagic URSA Viewfinder",
  "Blackmagic URSA VLock Battery Plate",
  "Blackmagic Video Assist",
  "Blackmagic Video Assist 4K",
  "Blackmagic Video Assist 5” 12G HDR",
  "Blackmagic Video Assist 5” 3G",
  "Blackmagic Video Assist 7” 12G HDR",
  "Blackmagic Video Assist 7” 3G",
  "Blackmagic Videohub 10x10 12G",
  "Blackmagic Videohub 120x120 12G",
  "Blackmagic Videohub 20x20 12G",
  "Blackmagic Videohub 40x40 12G",
  "Blackmagic Videohub 80x80 12G",
  "Blackmagic Videohub Mini 4x2 12G",
  "Blackmagic Videohub Mini 6x2 12G",
  "Blackmagic Videohub Mini 8x4 12G",
  "Blackmagic Web Presenter",
  "Blackmagic Web Presenter 4K",
  "Blackmagic Web Presenter HD",
  "Blackmagic Zoom Demand",
  "Cintel Audio and KeyKode Reader",
  "Cintel Cleaning Roller Kit",
  "Cintel Scanner",
  "Cintel Scanner 16mm Gate",
  "Cintel Scanner 16mm Gate HDR",
  "Cintel Scanner 2",
  "Cintel Scanner 35mm Gate",
  "Cintel Scanner 35mm Gate HDR",
  "Cintel Scanner 8mm Gate HDR",
  "Cintel Scanner C-Drive HDR",
  "Cintel Scanner G3 HDR+",
  "Cintel Scanner G3 HDR+ 8/16",
  "Cintel Scanner S-Drive HDR",
  "DaVinci Resolve",
  "DaVinci Resolve Studio",
  "DaVinci Resolve Advanced Panel",
  "DaVinci Resolve Editor Keyboard",
  "DaVinci Resolve Micro Color Panel",
  "DaVinci Resolve Micro Color Panel (JA)",
  "DaVinci Resolve Micro Panel",
  "DaVinci Resolve Mini Panel",
  "DaVinci Resolve Replay Editor",
  "DaVinci Resolve Speed Editor",
  "DeckLink 4K Extreme",
  "DeckLink 4K Extreme 12G",
  "DeckLink 4K Extreme 12G - HDMI 2.0",
  "DeckLink 4K Extreme 12G - Quad SDI",
  "DeckLink 4K Pro",
  "DeckLink 8K Pro",
  "DeckLink 8K Pro G2",
  "DeckLink 8K Pro Mini",
  "DeckLink Duo",
  "DeckLink Duo 2",
  "DeckLink Duo 2 Mini",
  "DeckLink IP 100G",
  "DeckLink IP HD",
  "DeckLink IP HD Optical",
  "DeckLink IP/SDI HD",
  "DeckLink Micro Recorder",
  "DeckLink Mini Monitor",
  "DeckLink Mini Monitor 4K",
  "DeckLink Mini Monitor HD",
  "DeckLink Mini Recorder",
  "DeckLink Mini Recorder 4K",
  "DeckLink Mini Recorder HD",
  "DeckLink Quad",
  "DeckLink Quad 2",
  "DeckLink Quad HDMI Recorder",
  "DeckLink SDI 4K",
  "DeckLink SDI Micro",
  "DeckLink Studio 4K",
  "DVI Extender",
  "Fairlight Audio Accelerator",
  "Fairlight Audio Interface",
  "Fairlight Audio MADI Upgrade",
  "Fairlight Console 0 Deg Leg Kit",
  "Fairlight Console 8 Deg Leg Kit",
  "Fairlight Console Audio Editor",
  "Fairlight Console Bundle 2 Bay",
  "Fairlight Console Bundle 3 Bay",
  "Fairlight Console Bundle 4 Bay",
  "Fairlight Console Bundle 5 Bay",
  "Fairlight Console Channel Control",
  "Fairlight Console Channel Control Blank",
  "Fairlight Console Channel Fader",
  "Fairlight Console Channel Fader Blank",
  "Fairlight Console Channel Rack Kit",
  "Fairlight Console Chassis 2 Bay",
  "Fairlight Console Chassis 3 Bay",
  "Fairlight Console Chassis 4 Bay",
  "Fairlight Console Chassis 5 Bay",
  "Fairlight Console LCD Monitor",
  "Fairlight Console LCD Monitor Blank",
  "Fairlight Console Mounting Bar 2 Bay",
  "Fairlight Console Mounting Bar 3 Bay",
  "Fairlight Console Mounting Bar 4 Bay",
  "Fairlight Console Mounting Bar 5 Bay",
  "Fairlight Console Side Arm Kit",
  "Fairlight Desktop Audio Editor",
  "Fairlight Desktop Console",
  "Fairlight HDMI Monitor Interface",
  "Fairlight Narrow Blank Kit",
  "Fusion",
  "Fusion Studio",
  "GPI and Tally Interface",
  "H.264 Pro Recorder",
  "HDLink Optical Fiber",
  "HDLink Pro 3D DisplayPort",
  "HDLink Pro DVI",
  "HyperDeck Extreme 4K HDR",
  "HyperDeck Extreme 8K HDR",
  "HyperDeck Extreme Control",
  "HyperDeck Extreme Rack Kit",
  "HyperDeck Shuttle",
  "HyperDeck Shuttle 4K Pro",
  "HyperDeck Shuttle 4K Pro 2TB",
  "HyperDeck Shuttle HD",
  "HyperDeck Shuttle Mounting Plate",
  "HyperDeck Studio",
  "HyperDeck Studio 12G",
  "HyperDeck Studio 4K Pro",
  "HyperDeck Studio HD Mini",
  "HyperDeck Studio HD Plus",
  "HyperDeck Studio HD Pro",
  "HyperDeck Studio Mini",
  "HyperDeck Studio Pro",
  "Intensity Pro",
  "Intensity Pro 4K",
  "Intensity Shuttle for Thunderbolt™",
  "Intensity Shuttle for USB 3.0",
  "Micro Converter BiDirectional SDI/HDMI",
  "Micro Converter BiDirectional SDI/HDMI 12G",
  "Micro Converter BiDirectional SDI/HDMI 12G wPSU",
  "Micro Converter BiDirectional SDI/HDMI 3G",
  "Micro Converter BiDirectional SDI/HDMI 3G wPSU",
  "Micro Converter BiDirectional SDI/HDMI wPSU",
  "Micro Converter HDMI to SDI",
  "Micro Converter HDMI to SDI 12G",
  "Micro Converter HDMI to SDI 12G wPSU",
  "Micro Converter HDMI to SDI 3G",
  "Micro Converter HDMI to SDI 3G wPSU",
  "Micro Converter HDMI to SDI wPSU",
  "Micro Converter Power Supply",
  "Micro Converter SDI to HDMI",
  "Micro Converter SDI to HDMI 12G",
  "Micro Converter SDI to HDMI 12G wPSU",
  "Micro Converter SDI to HDMI 3G",
  "Micro Converter SDI to HDMI 3G wPSU",
  "Micro Converter SDI to HDMI wPSU",
  "Mini Converter Analog to SDI",
  "Mini Converter Audio to SDI",
  "Mini Converter Audio to SDI 4K",
  "Mini Converter HDMI to SDI 4K",
  "Mini Converter HDMI to SDI 6G",
  "Mini Converter Heavy Duty Analog to SDI",
  "Mini Converter Heavy Duty HDMI to SDI 4K",
  "Mini Converter Heavy Duty SDI to Analog 4K",
  "Mini Converter Heavy Duty SDI to HDMI 4K",
  "Mini Converter Optical Fiber",
  "Mini Converter Optical Fiber 12G",
  "Mini Converter Optical Fiber 4K",
  "Mini Converter Quad SDI to HDMI 4K",
  "Mini Converter SDI Distribution 4K",
  "Mini Converter SDI Multiplex 4K",
  "Mini Converter SDI to Analog 4K",
  "Mini Converter SDI to Audio 4K",
  "Mini Converter SDI to HDMI 4K",
  "Mini Converter SDI to HDMI 6G",
  "Mini Converter Sync Generator",
  "Mini Converter UpDownCross",
  "Mini Converter UpDownCross HD",
  "Mini XLR Adapter Cables",
  "OpenGear Converter Analog to SDI",
  "OpenGear Converter Audio to SDI",
  "OpenGear Converter HDMI to SDI",
  "OpenGear Converter Optical Fiber",
  "OpenGear Converter SDI Distribution",
  "OpenGear Converter SDI to Analog",
  "OpenGear Converter SDI to Audio",
  "OpenGear Converter SDI to HDMI",
  "OpenGear Converter Sync Generator",
  "OpenGear Converter UpDownCross",
  "Pocket UltraScope",
  "Power Supply - Micro Converter 5V10W USBC",
  "Smart Videohub 12G 40x40",
  "Smart Videohub 12x12",
  "Smart Videohub 20x20",
  "Smart Videohub 40x40",
  "Smart Videohub CleanSwitch 12x12",
  "SmartScope Duo 4K",
  "SmartView 4K",
  "SmartView 4K G3",
  "SmartView Duo",
  "SmartView HD",
  "Teranex 2D Processor",
  "Teranex 3D Processor",
  "Teranex AV",
  "Teranex Express",
  "Teranex Mini 12G-SDI to Quad SDI",
  "Teranex Mini Analog to Optical 12G",
  "Teranex Mini Analog to SDI 12G",
  "Teranex Mini Audio to Optical 12G",
  "Teranex Mini Audio to SDI 12G",
  "Teranex Mini HDMI to Optical 12G",
  "Teranex Mini HDMI to SDI 12G",
  "Teranex Mini IP Video 12G",
  "Teranex Mini Optical to Analog 12G",
  "Teranex Mini Optical to Audio 12G",
  "Teranex Mini Optical to HDMI 12G",
  "Teranex Mini Quad SDI to 12G‑SDI",
  "Teranex Mini Rack Shelf",
  "Teranex Mini SDI Distribution 12G",
  "Teranex Mini SDI to Analog 12G",
  "Teranex Mini SDI to Audio 12G",
  "Teranex Mini SDI to DisplayPort 8K HDR",
  "Teranex Mini SDI to HDMI 12G",
  "Teranex Mini SDI to HDMI 8K HDR",
  "Teranex Mini Smart Panel",
  "Ultimatte 11",
  "Ultimatte 12",
  "Ultimatte 12 4K",
  "Ultimatte 12 8K",
  "Ultimatte 12 HD",
  "Ultimatte 12 HD Mini",
  "Ultimatte Smart Remote 4",
  "UltraStudio 4K",
  "UltraStudio 4K Extreme",
  "UltraStudio 4K Extreme 3",
  "UltraStudio 4K Mini",
  "UltraStudio Express",
  "UltraStudio HD Mini",
  "UltraStudio Mini Monitor",
  "UltraStudio Mini Recorder",
  "UltraStudio Monitor 3G",
  "UltraStudio Recorder 3G",
  "UltraStudio SDI",
  "Universal Videohub 288",
  "Universal Videohub 288 Crosspoint",
  "Universal Videohub 450W Power Card",
  "Universal Videohub 72",
  "Universal Videohub 72 Crosspoint",
  "Universal Videohub Deck Control Cable",
  "Universal Videohub Optical Fiber Interface",
  "Universal Videohub Power Supply",
  "Universal Videohub SDI Interface",
  "Videohub Master Control",
  "Videohub Master Control Pro",
  "Videohub Smart Control",
  "Videohub Smart Control Pro"
];

// --- TYPES ---
interface RepairLog {
  id: string;
  date: string;
  content: string;
}

interface CustomerData {
  productName: string;
  phone: string;
  address: string;
  repairItem: string; 
  serial: string;
  symptom: string;
  requestNotes?: string; // 점검요청 사항 추가
  customerName: string;
  purchaseDate: string; 
  purchaseLocation?: string; 
  trackingNumber: string; 
  quickServiceNumber?: string;
  repairResult?: string;
}

interface Ticket extends CustomerData {
  id: string;
  status: 'ADMISSION' | 'REPAIRING' | 'COMPLETION'; 
  admissionSent: boolean;
  completionSent: boolean;
  quickServiceSent?: boolean;
  createdAt: string;
  admissionDate?: string; 
  completionDate?: string; 
  lastSendStatus?: 'IDLE' | 'SUCCESS' | 'FAILURE'; 
  isArchived?: boolean; 
  isImportant?: boolean; // 중요 고객 플래그
  repairLogs?: RepairLog[]; 
  exportStatus?: 'IDLE' | 'SUCCESS' | 'FAILURE'; 
  // 알림톡 발송 실패 상태 플래그 추가
  admissionSendFailed?: boolean;
  completionSendFailed?: boolean;
  quickSendFailed?: boolean;
}

declare global {
  interface Window {
    daum: any;
  }
}

const INITIAL_DATA: CustomerData = {
  productName: '',
  phone: '',
  address: '',
  repairItem: '',
  serial: '',
  symptom: '',
  requestNotes: '',
  customerName: '',
  purchaseDate: '',
  purchaseLocation: '',
  trackingNumber: '',
  quickServiceNumber: '',
  repairResult: ''
};

const formatPhoneNumber = (phone: string) => {
  const cleaned = String(phone || '').replace(/[^0-9]/g, '');
  if (cleaned.length === 11) return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  if (cleaned.length === 10) {
    if (cleaned.startsWith('02')) return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return phone;
};

// YYYY. M. D. HH:mm 형식으로 날짜 변환 (시간 포함)
const formatDateTime = (dateInput: string | undefined | null) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return dateInput; 
  
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  
  return `${y}. ${m}. ${d}. ${h}:${min}`;
};

// 기존 formatDate 함수 (시간 미포함, 구글시트 전송 등 호환성 유지)
const formatDate = (dateInput: string | undefined | null) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return dateInput;
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
};

// 7일 경과 확인 헬퍼 함수
const isOverdue = (dateString: string) => {
  if (!dateString) return false;
  // "YYYY. M. D." 혹은 "YYYY. M. D. HH:mm" 파싱
  const parts = dateString.replace(/\./g, ' ').replace(/:/g, ' ').split(' ').filter(p => p.trim() !== '').map(Number);
  if (parts.length < 3) return false;
  
  const ticketDate = new Date(parts[0], parts[1] - 1, parts[2]);
  
  const now = new Date();
  now.setHours(0,0,0,0);
  ticketDate.setHours(0,0,0,0);
  
  const diffTime = now.getTime() - ticketDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  return diffDays >= 7;
};

// 날짜 문자열 파싱 헬퍼 함수 (시간 지원)
const parseDateString = (dateStr: string | undefined) => {
  if (!dateStr) return 0;
  const clean = dateStr.trim();

  // Try standard date parsing first
  const d = new Date(clean);
  if (!isNaN(d.getTime())) return d.getTime();

  // Custom parsing for "YYYY. M. D. HH:mm" or "YYYY. M. D."
  const parts = clean.split('.').map(p => p.trim()).filter(p => p);
  
  if (parts.length >= 3) {
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      const d = parseInt(parts[2]);
      let h = 0, min = 0;
      
      // 시간 부분이 있는 경우 (마지막 파트에 시간 포함 혹은 별도 파트로 존재)
      // 예: "2024. 5. 21. 14:30" -> parts[3] = "14:30"
      if (parts.length >= 4 && parts[3].includes(':')) {
          const t = parts[3].split(':');
          h = parseInt(t[0]) || 0;
          min = parseInt(t[1]) || 0;
      }
      
      return new Date(y, m, d, h, min).getTime();
  }
  return 0;
};

const isArchivedTicket = (ticket: Ticket) => {
  if (ticket.isArchived) return true;
  if (ticket.status !== 'COMPLETION' || !ticket.completionDate) return false;
  const completionTime = new Date(ticket.completionDate).getTime();
  const now = new Date().getTime();
  const diffInDays = (now - completionTime) / (1000 * 3600 * 24);
  return diffInDays > 7;
};

const parseCSV = (text: string) => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (char === '"') {
      if (insideQuotes && nextChar === '"') { currentCell += '"'; i++; }
      else { insideQuotes = !insideQuotes; }
    } else if (char === ',' && !insideQuotes) { currentRow.push(currentCell); currentCell = ''; }
    else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentCell);
      if (currentRow.length > 0) rows.push(currentRow);
      currentRow = [];
      currentCell = '';
    } else { currentCell += char; }
  }
  if (currentCell || currentRow.length > 0) { currentRow.push(currentCell); rows.push(currentRow); }
  return rows;
};

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('as_tickets');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // 고객 DB: 전체 데이터를 메모리에 로드하지 않고 검색 결과만 저장
  const [customerSearchResults, setCustomerSearchResults] = useState<CustomerDBEntry[]>([]);
  const [dbCount, setDbCount] = useState<number>(0);

  const [deletedHistory, setDeletedHistory] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('as_deleted_history');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  // --- THEME STATE ---
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
      // 시스템 설정 확인
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  // Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // 앱 시작 시 MySQL 서버 DB 카운트 확인
  useEffect(() => {
    getCustomerCount().then(setDbCount).catch(console.error);
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Ref to keep track of deletedHistory for interval usage
  const deletedHistoryRef = useRef(deletedHistory);
  const fileInputRef = useRef<HTMLInputElement>(null); // 파일 인풋 ref

  useEffect(() => {
    deletedHistoryRef.current = deletedHistory;
  }, [deletedHistory]);

  const [activeTab, setActiveTab] = useState<'ADMISSION' | 'REPAIRING' | 'COMPLETION' | 'ARCHIVE' | 'HISTORY'>('ADMISSION');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [newData, setNewData] = useState<CustomerData>(INITIAL_DATA);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  
  // 수리 이력(상담내역) 상태
  const [repairHistory, setRepairHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // 제품명 검색을 위한 상태 추가
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const productDropdownRef = useRef<HTMLDivElement>(null);

  // 고객명 검색(DB연동)을 위한 상태 추가
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  // URL 상태가 아닌 상수로 고정
  const webAppUrl = GOOGLE_WEBAPP_URL;

  // 수리 이력 조회
  useEffect(() => {
    if (activeTab === 'HISTORY') {
        const fetchHistory = async () => {
            setHistoryLoading(true);
            try {
                const res = await fetch(`/api/repair-history?search=${encodeURIComponent(searchTerm)}`);
                if (res.ok) {
                    const data = await res.json();
                    setRepairHistory(data);
                }
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setHistoryLoading(false);
            }
        };
        // 검색어 입력 시 디바운스 처리 등을 하면 좋지만, 여기서는 간단히 처리
        const timer = setTimeout(fetchHistory, 300);
        return () => clearTimeout(timer);
    }
  }, [activeTab, searchTerm]);

  // 자동 동기화 상태 제거 및 하드코딩
  const [lastSyncTime, setLastSyncTime] = useState<string>('-');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [archiveConfirmId, setArchiveConfirmId] = useState<string | null>(null);
  const [warningModalTicketId, setWarningModalTicketId] = useState<string | null>(null);
  // Warning Type State: START_REPAIR (for admission) or ARCHIVE (for completion)
  const [warningType, setWarningType] = useState<'START_REPAIR' | 'ARCHIVE'>('START_REPAIR');
  const [expandedTicketIds, setExpandedTicketIds] = useState<Set<string>>(new Set());
  const [logInputs, setLogInputs] = useState<Record<string, string>>({});
  const logListRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // 타임라인 열림 상태 관리
  const [expandedTimelineIds, setExpandedTimelineIds] = useState<Set<string>>(new Set());

  // Archive Filter States
  const [filterYear, setFilterYear] = useState<string>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');

  // Fix: Adding missing isDirectInput state
  const [isDirectInput, setIsDirectInput] = useState(false);
  
  // 관리자 인증 모달 상태
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [pendingAction, setPendingAction] = useState<{type: 'BULK_DELETE' | 'SINGLE_DELETE', id?: string} | null>(null);

  useEffect(() => { localStorage.setItem('as_tickets', JSON.stringify(tickets)); }, [tickets]);
  // URL 저장을 위한 useEffect 제거
  useEffect(() => { localStorage.setItem('as_deleted_history', JSON.stringify(Array.from(deletedHistory))); }, [deletedHistory]);
  // 고객 DB LocalStorage 저장은 제거 (IndexedDB 사용)
  
  useEffect(() => {
    setSelectedTicketIds(new Set());
  }, [activeTab]);
  
  // 외부 클릭 시 제품 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target)) {
        setIsProductSearchOpen(false);
      }
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setIsCustomerSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { 
        const el = document.querySelector('script[src*="postcode.v2.js"]');
        if (el) document.body.removeChild(el);
    }
  }, []);

  // 엑셀 업로드 처리 함수 (MySQL Server로 업로드)
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingMap(prev => ({ ...prev, 'db_upload': true }));

    try {
      // 서버 API 호출
      const result = await uploadExcelToServer(file);
      
      // DB 카운트 갱신
      const count = await getCustomerCount();
      setDbCount(count);
      
      alert(`${result.count}명의 고객 데이터가 MySQL DB에 성공적으로 저장되었습니다.`);
    } catch (error: any) {
      console.error("Excel Upload Error:", error);
      alert(`업로드 실패: ${error.message}`);
    } finally {
      setLoadingMap(prev => ({ ...prev, 'db_upload': false }));
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExcelButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const selectCustomerFromDb = (entry: CustomerDBEntry) => {
    setNewData(prev => ({
      ...prev,
      customerName: entry.고객명 || '',
      phone: formatPhoneNumber(entry.이동통신 || entry.회사전화1 || ''),
      address: entry.회사주소1 || '',
      purchaseLocation: entry.회사명 || ''
    }));
    setIsCustomerSearchOpen(false);
  };

  const openAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) return;
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        let fullAddress = data.address;
        if (data.addressType === 'R') {
          let extra = '';
          if (data.bname !== '') extra += data.bname;
          if (data.buildingName !== '') extra += (extra !== '' ? `, ${data.buildingName}` : data.buildingName);
          fullAddress += (extra !== '' ? ` (${extra})` : '');
        }
        handleInputChange('address', fullAddress);
      }
    }).open();
  };

  // Archive 탭에서 사용 가능한 연도 목록 추출
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    tickets.filter(t => isArchivedTicket(t)).forEach(t => {
       if(t.completionDate) {
           years.add(new Date(t.completionDate).getFullYear().toString());
       }
    });
    // 내림차순 정렬 (최신 연도 우선)
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    // 중요: 원본 배열을 복사하여 정렬에 사용 (React State 변형 방지)
    let result = [...tickets];
    
    // 1. 탭 필터
    if (activeTab === 'ARCHIVE') {
        result = result.filter(t => isArchivedTicket(t));
        // 1-1. 연도 필터
        if (filterYear !== 'ALL') {
             result = result.filter(t => t.completionDate && new Date(t.completionDate).getFullYear().toString() === filterYear);
        }
        // 1-2. 월 필터
        if (filterMonth !== 'ALL') {
             result = result.filter(t => t.completionDate && (new Date(t.completionDate).getMonth() + 1).toString() === filterMonth);
        }
    } else {
        result = result.filter(t => !isArchivedTicket(t));
        result = result.filter(t => t.status === activeTab);
    }

    // 2. 검색 필터
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const digits = term.replace(/[^0-9]/g, '');
      result = result.filter(t => 
        t.customerName.toLowerCase().includes(term) || 
        (digits.length > 0 && String(t.phone || '').replace(/[^0-9]/g, '').includes(digits)) ||
        (t.serial && t.serial.toLowerCase().includes(term)) ||
        t.productName.toLowerCase().includes(term)
      );
    }
    
    // 3. 정렬: 최신순 (접수일 날짜 내림차순 -> ID 타임스탬프/인덱스 내림차순)
    result.sort((a, b) => {
        const dateA = parseDateString(a.createdAt);
        const dateB = parseDateString(b.createdAt);
        
        // 날짜가 다르면 날짜 내림차순 (최신 날짜가 위로)
        if (dateA !== dateB) {
            return dateB - dateA;
        }
        
        // 날짜가 같으면 생성 정보(ID) 내림차순 (ID에 포함된 타임스탬프 활용)
        // ID 형식: t_{timestamp} 또는 sheet_{timestamp}_{index}
        const getInfo = (id: string) => {
            const parts = id.split('_');
            const ts = parseInt(parts[1]) || 0;
            // sheet로 시작하고 3번째 파트가 있으면 index로 사용
            const idx = parts.length >= 3 ? (parseInt(parts[2]) || 0) : 0;
            return { ts, idx };
        };
        
        const infoA = getInfo(a.id);
        const infoB = getInfo(b.id);
        
        if (infoA.ts !== infoB.ts) {
            return infoB.ts - infoA.ts; // 타임스탬프 내림차순 (최신 등록이 위로)
        }
        
        // 타임스탬프가 같으면(일괄등록 등) 인덱스 내림차순 (나중에 등록된 것이 위로)
        return infoB.idx - infoA.idx;
    });

    return result;
  }, [tickets, activeTab, searchTerm, filterYear, filterMonth]);

  const counts = useMemo(() => {
    const archived = tickets.filter(t => isArchivedTicket(t)).length;
    const active = tickets.filter(t => !isArchivedTicket(t));
    return {
      ARCHIVE: archived,
      ADMISSION: active.filter(t => t.status === 'ADMISSION').length,
      REPAIRING: active.filter(t => t.status === 'REPAIRING').length,
      COMPLETION: active.filter(t => t.status === 'COMPLETION').length
    };
  }, [tickets]);

  const toggleTicketExpansion = (id: string) => {
    setExpandedTicketIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  
  const toggleTimeline = (id: string) => {
    setExpandedTimelineIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleImportant = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setTickets(prev => prev.map(t => t.id === id ? { ...t, isImportant: !t.isImportant } : t));
  };

  const handleAutoSync = useCallback(async (isSilent = false) => {
    const SHEET_ID = '1hx5Q9jtnAMRQvU0_QACQOPnllctXLRrpeD4L8oodVIE';
    const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
    if (!isSilent) setLoadingMap(prev => ({ ...prev, 'sync': true }));
    try {
      const response = await fetch(CSV_URL);
      if (!response.ok) throw new Error();
      const text = await response.text();
      const rows = parseCSV(text);
      
      setTickets(current => {
        const newTickets: Ticket[] = [];
        const existing = new Set(current.map(t => `${String(t.phone).replace(/[^0-9]/g, '')}-${t.productName}`));
        
        rows.forEach((row, i) => {
          if (!row || row.length < 3) return;
          const timestamp = row[0]; // A열: 타임스탬프
          const name = row[1]?.trim();
          let phone = row[2]?.trim().replace(/[^0-9]/g, '');
          const productName = row[4];
          
          if (!name || !phone || name === '이름' || phone.length < 8) return;
          if (phone.startsWith('82')) phone = '0' + phone.slice(2);
          
          const signature = `${phone}-${productName}`;
          // Ref를 사용하여 최신 삭제 기록 확인
          if (existing.has(signature) || deletedHistoryRef.current.has(signature)) return;
          
          newTickets.push({
            id: `sheet_${Date.now()}_${i}`, 
            customerName: name, 
            phone, 
            address: row[3], 
            productName: productName,
            repairItem: productName, 
            serial: row[5], 
            symptom: row[6], 
            requestNotes: row[8], // I열: 점검요청 사항
            status: 'ADMISSION',
            admissionSent: false, 
            completionSent: false, 
            // 타임스탬프가 있으면 그것을 사용, 없으면 현재 시간 사용 (시간 포함)
            createdAt: timestamp ? formatDateTime(timestamp) : formatDateTime(new Date().toISOString()),
            purchaseDate: '', 
            purchaseLocation: '', 
            trackingNumber: '', 
            repairLogs: [], 
            repairResult: ''
          });
        });
        if (newTickets.length > 0) return [...newTickets, ...current];
        return current;
      });
      setLastSyncTime(new Date().toLocaleTimeString('ko-KR'));
    } catch (e) { if (!isSilent) alert('동기화 실패'); }
    finally { if (!isSilent) setLoadingMap(prev => ({ ...prev, 'sync': false })); }
  }, []);

  // 항상 자동 동기화 실행 (30초 간격)
  useEffect(() => {
    handleAutoSync(true); // 마운트 시 즉시 실행
    const interval = setInterval(() => handleAutoSync(true), 30000);
    return () => clearInterval(interval);
  }, [handleAutoSync]);

  const handleInputChange = (f: keyof CustomerData, v: string) => {
    setNewData(p => ({ ...p, [f]: v }));
    
    // 고객명 입력 시 DB 검색 (비동기, MySQL API 호출)
    if (f === 'customerName') {
        if (v.trim()) {
           searchCustomersByName(v).then(results => {
              setCustomerSearchResults(results);
              setIsCustomerSearchOpen(true);
           });
        } else {
           setCustomerSearchResults([]);
           setIsCustomerSearchOpen(false);
        }
    }
  };
  const handlePhoneChange = (e: any) => {
    let v = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    let f = v;
    if (v.length > 3 && v.length <= 7) f = `${v.slice(0, 3)}-${v.slice(3)}`;
    else if (v.length > 7) f = `${v.slice(0, 3)}-${v.slice(3, 7)}-${v.slice(7)}`;
    handleInputChange('phone', f);
  };

  const handleTrackingUpdate = (id: string, v: string) => {
    const clean = v.replace(/[^0-9]/g, '').slice(0, 12); // 운송장 번호 길이를 좀 더 유연하게
    setTickets(prev => prev.map(t => t.id === id ? { ...t, trackingNumber: clean } : t));
  };
  
  const handleRepairResultUpdate = (id: string, v: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, repairResult: v } : t));
  };

  const handleQuickServiceUpdate = (id: string, v: string) => {
    let clean = v.replace(/[^0-9]/g, '').slice(0, 11);
    let f = clean;
    if (clean.length > 3 && clean.length <= 7) f = `${clean.slice(0, 3)}-${clean.slice(3)}`;
    else if (clean.length > 7) f = `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7)}`;
    setTickets(prev => prev.map(t => t.id === id ? { ...t, quickServiceNumber: f } : t));
  };

  // 새로운 보관 및 전송 통합 함수
  const performArchive = async (id: string) => {
    // 1. UI update: 보관함으로 즉시 이동 (Optimistic UI)
    setTickets(prev => prev.map(t => t.id === id ? { ...t, isArchived: true } : t));
    setArchiveConfirmId(null);

    // 2. 구글 시트 전송 준비
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    const url = webAppUrl.trim();
    if (!url.startsWith('https://script.google.com/macros/s/')) return;

    setLoadingMap(prev => ({ ...prev, [id]: true }));

    try {
        await sendTicketsToSheet([{
             ...ticket,
             isArchived: true, // 보관됨 상태로 전송
             completionDate: ticket.completionDate || new Date().toISOString()
        }], url);

        setTickets(prev => prev.map(t => t.id === id ? { ...t, exportStatus: 'SUCCESS' } : t));
    } catch (error) {
        console.error('Auto Archive Export Error:', error);
        setTickets(prev => prev.map(t => t.id === id ? { ...t, exportStatus: 'FAILURE' } : t));
        alert('구글 시트 자동 전송에 실패했습니다.');
    } finally {
        setLoadingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleManualArchive = (e: any, id: string) => {
    e.stopPropagation();
    if (archiveConfirmId === id) {
      performArchive(id);
    } else {
      setArchiveConfirmId(id);
      setTimeout(() => setArchiveConfirmId(null), 3000);
    }
  };

  const onArchiveClick = (e: any, ticket: Ticket) => {
    e.stopPropagation();
    // 택배 발송(completionSent) 또는 퀵서비스 발송(quickServiceSent) 중 하나라도 보냈으면 경고 없이 보관
    if (!ticket.completionSent && !ticket.quickServiceSent) {
         setWarningType('ARCHIVE');
         setWarningModalTicketId(ticket.id);
    } else {
         handleManualArchive(e, ticket.id);
    }
  };

  const handleRestore = (e: any, id: string) => {
    e.stopPropagation();
    setTickets(prev => prev.map(t => t.id === id ? { ...t, isArchived: false, status: 'REPAIRING' } : t));
  };

  const toggleSelection = (id: string) => {
    setSelectedTicketIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedTicketIds.size === filteredTickets.length && filteredTickets.length > 0) {
      setSelectedTicketIds(new Set());
    } else {
      setSelectedTicketIds(new Set(filteredTickets.map(t => t.id)));
    }
  };

  const handleAdminAuth = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (adminPasswordInput === ADMIN_PASSWORD) {
      if (pendingAction?.type === 'BULK_DELETE') {
        executeBulkDelete();
      } else if (pendingAction?.type === 'SINGLE_DELETE' && pendingAction.id) {
        executeSingleDelete(pendingAction.id);
      }
      setIsAdminAuthOpen(false);
      setAdminPasswordInput('');
      setAuthError(false);
      setPendingAction(null);
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 500);
    }
  };

  const executeBulkDelete = () => {
    try {
      const itemsToDelete = tickets.filter(t => selectedTicketIds.has(t.id));
      setDeletedHistory(prev => {
        const next = new Set(prev);
        itemsToDelete.forEach(t => {
          const phone = t.phone ? String(t.phone).replace(/[^0-9]/g, '') : '';
          const product = t.productName ? String(t.productName) : '';
          if (phone || product) next.add(`${phone}-${product}`);
        });
        return next;
      });
      setTickets(prev => prev.filter(t => !selectedTicketIds.has(t.id)));
      setSelectedTicketIds(new Set());
      setTimeout(() => alert('삭제되었습니다.'), 50);
    } catch (e) {
      alert('삭제 처리 중 오류가 발생했습니다.');
    }
  };

  const executeSingleDelete = (id: string) => {
    const ticketToDelete = tickets.find(t => t.id === id);
    if (ticketToDelete) {
      const phone = ticketToDelete.phone ? String(ticketToDelete.phone).replace(/[^0-9]/g, '') : '';
      const signature = `${phone}-${ticketToDelete.productName || ''}`;
      setDeletedHistory(prev => {
        const next = new Set(prev);
        next.add(signature);
        return next;
      });
    }
    setTickets(prev => prev.filter(t => t.id !== id));
    setDeleteConfirmId(null);
  };

  const handleBulkDeleteRequest = () => {
    if (selectedTicketIds.size === 0) return;
    setPendingAction({ type: 'BULK_DELETE' });
    setIsAdminAuthOpen(true);
  };

  const handleDeleteClick = (e: any, id: string) => {
    e.stopPropagation();
    if (activeTab === 'ARCHIVE') {
      setPendingAction({ type: 'SINGLE_DELETE', id });
      setIsAdminAuthOpen(true);
    } else {
      if (deleteConfirmId === id) {
        executeSingleDelete(id);
      } else {
        setDeleteConfirmId(id);
        setTimeout(() => setDeleteConfirmId(null), 3000);
      }
    }
  };

  const openNewModal = () => { 
      setEditingTicketId(null); 
      setNewData({ ...INITIAL_DATA }); 
      setIsDirectInput(false); 
      setIsModalOpen(true); 
  };
  
  const openEditModal = (t: Ticket) => { 
      setEditingTicketId(t.id); 
      setNewData({ ...t }); 
      const isCustom = t.productName && !PRODUCT_LIST.includes(t.productName);
      setIsDirectInput(!!isCustom);
      setIsModalOpen(true); 
  };
  
  const closeModal = () => { 
      setIsModalOpen(false); 
      setEditingTicketId(null); 
      setNewData({ ...INITIAL_DATA }); 
      setIsDirectInput(false);
      // 모달 닫을 때 검색 결과 초기화
      setCustomerSearchResults([]);
      setIsCustomerSearchOpen(false);
  };

  const handleSaveTicket = () => {
    if (!newData.customerName || !newData.phone) return alert('필수 항목 입력');
    if (editingTicketId) setTickets(prev => prev.map(t => t.id === editingTicketId ? { ...t, ...newData } : t));
    else setTickets(prev => [{ ...newData, id: `t_${Date.now()}`, status: 'ADMISSION', admissionSent: false, completionSent: false, createdAt: formatDateTime(new Date().toISOString()), trackingNumber: '', repairLogs: [], repairResult: '' }, ...prev]);
    closeModal();
  };

  const changeStatus = async (e: any, id: string, s: Ticket['status']) => {
    if (e && e.stopPropagation) e.stopPropagation();
    
    const now = new Date().toISOString();
    const isCompleting = s === 'COMPLETION';

    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        const updates: Partial<Ticket> = { status: s };
        if (isCompleting && !t.completionDate) {
          updates.completionDate = now;
        }
        return { ...t, ...updates };
      }
      return t;
    }));
  };

  const handleAddLog = (id: string) => {
    const c = logInputs[id];
    if (!c?.trim()) return;
    const log = { id: Date.now().toString(), date: new Date().toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }), content: c.trim() };
    setTickets(prev => prev.map(t => t.id === id ? { ...t, repairLogs: [...(t.repairLogs || []), log] } : t));
    setLogInputs(prev => ({ ...prev, [id]: '' }));
    setTimeout(() => { if (logListRefs.current[id]) logListRefs.current[id]!.scrollTop = logListRefs.current[id]!.scrollHeight; }, 100);
  };

  const handleSendAlimtalk = async (e: any, ticket: Ticket, type: 'GENERAL' | 'QUICK' = 'GENERAL') => {
    if (e && e.stopPropagation) e.stopPropagation();
    let tid = '';
    
    // [개선] 템플릿 변수를 더 풍부하게 설정하여 오류 방지
    let vars: any = { 
        "#{고객님}": ticket.customerName,
        "#{제품명}": ticket.productName || '제품',
        "#{SN}": ticket.serial || '-',
        "#{접수일}": ticket.createdAt || '-',
        "#{증상}": ticket.symptom || '점검',
    };

    if (type === 'QUICK') {
      tid = SOLAPI_CONFIG.QUICK_TEMPLATE_ID;
      vars["#{퀵기사님연락처}"] = ticket.quickServiceNumber || '-';
    } else {
      tid = ticket.status === 'ADMISSION' ? SOLAPI_CONFIG.ADMISSION_TEMPLATE_ID : SOLAPI_CONFIG.COMPLETION_TEMPLATE_ID;
      if (ticket.status === 'COMPLETION') {
        vars["#{운송장번호}"] = ticket.trackingNumber || '-';
        vars["#{수리결과}"] = ticket.repairResult || '수리 완료'; // Add repair result for completion
      }
    }
    
    const loadingKey = type === 'QUICK' ? `${ticket.id}_quick` : ticket.id;
    setLoadingMap(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      const clean = String(ticket.phone || '').replace(/[^0-9]/g, '');
      await sendAlimTalk(clean, vars, tid);
      
      setTickets(prev => prev.map(t => {
        if (t.id === ticket.id) {
          if (type === 'QUICK') return { ...t, quickServiceSent: true, quickSendFailed: false };
          return { 
            ...t, 
            [ticket.status === 'ADMISSION' ? 'admissionSent' : 'completionSent']: true, 
            [ticket.status === 'ADMISSION' ? 'admissionSendFailed' : 'completionSendFailed']: false,
            [ticket.status === 'ADMISSION' ? 'admissionDate' : 'completionDate']: new Date().toISOString() 
          };
        }
        return t;
      }));
      alert('발송 성공');
    } catch (err: any) { 
      setTickets(prev => prev.map(t => {
        if (t.id === ticket.id) {
           if (type === 'QUICK') return { ...t, quickSendFailed: true };
           return {
             ...t,
             [ticket.status === 'ADMISSION' ? 'admissionSendFailed' : 'completionSendFailed']: true
           };
        }
        return t;
      }));
      alert(`실패: ${err.message}`); 
    } finally { 
      setLoadingMap(prev => ({ ...prev, [loadingKey]: false })); 
    }
  };

  const handleStartRepairClick = (e: React.MouseEvent, ticket: Ticket) => {
    e.stopPropagation();
    if (!ticket.admissionSent) {
      setWarningType('START_REPAIR');
      setWarningModalTicketId(ticket.id);
    } else {
      changeStatus(e, ticket.id, 'REPAIRING');
    }
  };

  const handleWarningSend = async (ticket: Ticket) => {
    setWarningModalTicketId(null);
    await handleSendAlimtalk({ stopPropagation: () => {} }, ticket);
  };

  const handleWarningProceed = (ticket: Ticket) => {
    setWarningModalTicketId(null);
    if (warningType === 'START_REPAIR') {
      changeStatus({ stopPropagation: () => {} }, ticket.id, 'REPAIRING');
    } else {
      performArchive(ticket.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200 shrink-0"><MonitorSmartphone className="h-6 w-6 text-white" /></div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none truncate">하이픽셀플러스 수리 입출고 시스템</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleExcelUpload} 
            />
             {/* 엑셀 업로드 버튼 (MySQL Upload) */}
             <button
                onClick={handleExcelButtonClick}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-2.5 rounded-xl shadow-sm transition-all relative group"
                title="고객 DB(엑셀) 서버 업로드"
                disabled={loadingMap['db_upload']}
            >
                {loadingMap['db_upload'] ? <Loader2 className="h-5 w-5 animate-spin text-blue-500" /> : <Database className="h-5 w-5 text-green-600 dark:text-green-500" />}
                {dbCount > 0 && (
                   <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">{dbCount > 9999 ? '9999+' : dbCount}</span>
                )}
            </button>
            <button
                onClick={toggleTheme}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-2.5 rounded-xl shadow-sm transition-all"
                title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button 
              onClick={() => handleAutoSync(false)}
              disabled={loadingMap['sync']}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 md:px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-70"
            >
              <RefreshCw className={`h-4 w-4 ${loadingMap['sync'] ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">가져오기</span>
            </button>
            <button onClick={openNewModal} className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md">
              <Plus className="h-5 w-5" /><span className="hidden sm:inline">신규 접수</span>
            </button>
          </div>
        </div>
      </header>
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 md:top-20 z-40 shadow-sm transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center overflow-x-auto scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0">
            {['ADMISSION', 'REPAIRING', 'COMPLETION', 'ARCHIVE', 'HISTORY'].map((id) => (
              <button key={id} onClick={() => setActiveTab(id as any)} className={`whitespace-nowrap px-4 md:px-6 h-14 md:h-16 flex items-center gap-2 text-sm font-bold border-b-2 transition-all ${activeTab === id ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>
                {id === 'ARCHIVE' && <Archive className="h-4 w-4" />}
                {id === 'REPAIRING' && <Wrench className="h-4 w-4" />}
                {id === 'HISTORY' && <History className="h-4 w-4" />}
                {id === 'ADMISSION' ? '입고' : id === 'REPAIRING' ? '수리중' : id === 'COMPLETION' ? '수리 완료' : id === 'HISTORY' ? '고객 상담내역' : '보관함'}
                {id !== 'HISTORY' && <span className={`text-[10px] text-white px-2 py-0.5 rounded-full ${activeTab === id ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}>{counts[id as keyof typeof counts]}</span>}
              </button>
            ))}
          </div>
          <div className="pb-3 md:pb-0 relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input 
              type="text" 
              placeholder="검색 (이름, 번호, SN)" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400" 
            />
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6 pb-24">
        {activeTab === 'HISTORY' ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap">접수일</th>
                                <th className="px-6 py-4 whitespace-nowrap">고객명</th>
                                <th className="px-6 py-4 whitespace-nowrap">회사명</th>
                                <th className="px-6 py-4 whitespace-nowrap">연락처</th>
                                <th className="px-6 py-4 whitespace-nowrap">상담내역</th>
                                <th className="px-6 py-4 whitespace-nowrap">처리결과</th>
                                <th className="px-6 py-4 whitespace-nowrap">접수자</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {historyLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                        데이터를 불러오는 중입니다...
                                    </td>
                                </tr>
                            ) : repairHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                                        검색 결과가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                repairHistory.map((item, idx) => (
                                    <tr key={item.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                            {item['접수일'] ? new Date(item['접수일']).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                                            {item['고객명_x']}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                            {item['회사명']}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap font-mono">
                                            {item['이동통신_x']}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 min-w-[300px]">
                                            {item['상담내역']}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 min-w-[200px]">
                                            {item['처리결과']}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            {item['접수자']}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : activeTab === 'ARCHIVE' && (
          <div className="mb-4 space-y-3">
             {/* Year/Month Filters */}
             <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                   <Filter className="h-4 w-4 text-slate-400" />
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-300 mr-1">완료일:</span>
                   <select 
                     value={filterYear} 
                     onChange={(e) => setFilterYear(e.target.value)}
                     className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                   >
                     <option value="ALL">전체 연도</option>
                     {availableYears.map(year => (
                       <option key={year} value={year}>{year}년</option>
                     ))}
                   </select>
                   <select 
                     value={filterMonth} 
                     onChange={(e) => setFilterMonth(e.target.value)}
                     className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                   >
                     <option value="ALL">전체 월</option>
                     {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                       <option key={m} value={m}>{m}월</option>
                     ))}
                   </select>
                </div>
             </div>

             <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    {filteredTickets.length > 0 && (
                      <div 
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 select-none shadow-sm shrink-0" 
                        onClick={toggleSelectAll}
                      >
                        {selectedTicketIds.size === filteredTickets.length && filteredTickets.length > 0 ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-300" />
                        )}
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">전체 선택 ({filteredTickets.length})</span>
                      </div>
                    )}
                    
                    {selectedTicketIds.size > 0 && (
                      <button 
                        onClick={handleBulkDeleteRequest} 
                        type="button" 
                        className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm transition-all shrink-0"
                      >
                          <Trash2 className="h-4 w-4" />
                          선택 삭제 ({selectedTicketIds.size})
                      </button>
                    )}
                </div>
             </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredTickets.map((ticket) => {
            const isExpanded = expandedTicketIds.has(ticket.id);
            const isArchived = isArchivedTicket(ticket);
            const isSelected = selectedTicketIds.has(ticket.id);
            const isTimelineOpen = expandedTimelineIds.has(ticket.id);
            const isOverdueTicket = ticket.status === 'ADMISSION' && !isArchived && isOverdue(ticket.createdAt);

            return (
              <div 
                key={ticket.id} 
                className={`bg-white dark:bg-slate-900 rounded-xl border transition-all shadow-sm relative overflow-hidden 
                ${isSelected ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/10 dark:bg-blue-900/20' : 
                  ticket.isImportant ? 'border-amber-400 ring-1 ring-amber-300 bg-amber-50/30 dark:bg-amber-900/20' : 
                  isExpanded ? 'ring-1 ring-slate-200 dark:ring-slate-700' : 
                  isArchived ? 'border-amber-200 dark:border-amber-900' : 
                  ticket.status === 'COMPLETION' ? 'border-green-200 dark:border-green-900' : 
                  ticket.status === 'REPAIRING' ? 'border-indigo-100 dark:border-indigo-900' : 'border-slate-200 dark:border-slate-800'}`}
              >
                {activeTab === 'ARCHIVE' && (
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center z-10 border-r border-transparent md:border-slate-50 dark:md:border-slate-800 cursor-pointer group" onClick={(e) => { e.stopPropagation(); toggleSelection(ticket.id); }}>
                     <div className="p-2 rounded-full group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                       {isSelected ? <CheckSquare className="h-5 w-5 text-blue-600" /> : <Square className="h-5 w-5 text-slate-300" />}
                     </div>
                  </div>
                )}

                <div className={`p-4 flex flex-col md:flex-row gap-4 items-start md:items-center cursor-pointer relative ${activeTab === 'ARCHIVE' ? 'pl-14' : ''}`} onClick={() => toggleTicketExpansion(ticket.id)}>
                  {isArchived && (
                    <div className="absolute top-2 right-12 flex items-center gap-1.5" title="전송 상태">
                      {ticket.exportStatus === 'SUCCESS' ? <CheckCircle className="h-4 w-4 text-green-500" /> : ticket.exportStatus === 'FAILURE' ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <div className="h-4 w-4 rounded-full border-2 border-slate-200 dark:border-slate-700" />}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{ticket.customerName}</h3>
                      <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{formatPhoneNumber(ticket.phone)}</span>
                      {(ticket.status === 'COMPLETION' || isArchived) && ticket.completionDate && (
                         <span className="text-[10px] px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded font-bold ml-2">
                           {new Date(ticket.completionDate).toLocaleDateString('ko-KR').slice(2).replace(/\./g, '/').replace(/ /g,'')} 완료
                         </span>
                      )}
                      {/* Reception Date Badge - 입고 및 수리중 상태에서 표시 */}
                      {(ticket.status === 'ADMISSION' || ticket.status === 'REPAIRING') && ticket.createdAt && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded font-bold ml-2">
                              {/* 시간까지 표시하려면 slice 조정 필요, 현재는 날짜만 간략히 표시 */}
                              {ticket.createdAt.split(' ')[0] && ticket.createdAt.split(' ')[0].length > 4 ? ticket.createdAt.slice(2).split(' ').slice(0, 3).join('').replace(/\./g, '/') : ticket.createdAt} 접수
                          </span>
                      )}
                      {isOverdueTicket && (
                        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded font-bold ml-2 border border-red-200 dark:border-red-900">
                          <Clock className="h-3 w-3" /> 7일 경과
                        </span>
                      )}
                      {ticket.isImportant && (
                        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded font-bold ml-2 border border-amber-200 dark:border-amber-900">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> 중요
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-medium">{ticket.productName}</span>
                      <span className="text-slate-400 dark:text-slate-500 text-xs ml-3">SN: {ticket.serial || '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                    {/* 중요 고객 표시 버튼 */}
                    {(ticket.status === 'REPAIRING' || ticket.status === 'ADMISSION') && !isArchived && (
                       <button 
                         onClick={(e) => toggleImportant(e, ticket.id)}
                         className={`p-2 rounded-lg transition-colors ${ticket.isImportant ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500' : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                         title="중요 고객 표시"
                       >
                         <Star className={`h-5 w-5 ${ticket.isImportant ? 'fill-amber-500' : ''}`} />
                       </button>
                    )}

                    {ticket.status === 'ADMISSION' && !isArchived && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={e => handleSendAlimtalk(e, ticket)} 
                          disabled={loadingMap[ticket.id]} 
                          className={`${
                            ticket.admissionSent ? 'bg-slate-700 dark:bg-slate-600' : 
                            ticket.admissionSendFailed ? 'bg-red-500 hover:bg-red-600' : 
                            'bg-blue-600'
                          } text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform`}
                        >
                          {loadingMap[ticket.id] ? <Loader2 className="h-3 w-3 animate-spin"/> : (
                            ticket.admissionSent ? <Check className="h-3 w-3"/> : 
                            ticket.admissionSendFailed ? <RotateCcw className="h-3 w-3"/> : 
                            <MessageSquare className="h-3 w-3"/>
                          )}
                          {ticket.admissionSent ? '보냄' : ticket.admissionSendFailed ? '재시도' : '알림톡'}
                        </button>
                        <button onClick={e => handleStartRepairClick(e, ticket)} className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-bold active:scale-95 transition-transform">수리 시작</button>
                      </div>
                    )}
                    
                    {ticket.status === 'REPAIRING' && !isArchived && (
                      <button onClick={e => changeStatus(e, ticket.id, 'COMPLETION')} className="bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-bold active:scale-95 transition-transform">수리 완료</button>
                    )}
                    
                    {ticket.status === 'COMPLETION' && !isArchived && (
                      <div className="flex items-center gap-2">
                        <button onClick={e => onArchiveClick(e, ticket)} className="border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 px-3 py-2 rounded-lg text-xs font-bold active:scale-95 transition-transform">
                          {archiveConfirmId === ticket.id ? '확인' : '보관'}
                        </button>
                      </div>
                    )}

                    {isArchived && <button onClick={e => handleRestore(e, ticket.id)} className="border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 px-3 py-2 rounded-lg text-xs font-bold active:scale-95 transition-transform">복구</button>}
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className={`border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-4 animate-in slide-in-from-top-1 ${activeTab === 'ARCHIVE' ? 'pl-14' : ''}`}>
                    
                    {/* 수리 완료 상태 또는 보관함 상태일 때 상단에 택배/퀵서비스 섹션 배치 */}
                    {(ticket.status === 'COMPLETION' || isArchived) && (
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                           {/* 택배 발송 섹션 */}
                           <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                              <span className="font-bold text-slate-400 block text-xs uppercase mb-2 flex items-center gap-1"><Package className="h-3 w-3" /> 택배 발송</span>
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={ticket.trackingNumber || ''} 
                                  onChange={e => handleTrackingUpdate(ticket.id, e.target.value)} 
                                  className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-slate-100" 
                                  placeholder="운송장 번호 입력" 
                                />
                                <button 
                                  onClick={e => handleSendAlimtalk(e, ticket)}
                                  disabled={loadingMap[ticket.id]}
                                  className={`${
                                    ticket.completionSent ? 'bg-slate-700 dark:bg-slate-600' : 
                                    ticket.completionSendFailed ? 'bg-red-500 hover:bg-red-600' : 
                                    'bg-blue-600'
                                  } text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors`}
                                >
                                  {loadingMap[ticket.id] ? <Loader2 className="h-3 w-3 animate-spin"/> : (
                                    ticket.completionSent ? <Check className="h-3 w-3"/> : 
                                    ticket.completionSendFailed ? <RotateCcw className="h-3 w-3"/> : 
                                    <MessageSquare className="h-3 w-3"/>
                                  )}
                                  {ticket.completionSent ? '보냄' : ticket.completionSendFailed ? '재시도' : '전송'}
                                </button>
                              </div>
                           </div>

                           {/* 퀵서비스 섹션 */}
                           <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                              <span className="font-bold text-slate-400 block text-xs uppercase mb-2 flex items-center gap-1"><Bike className="h-3 w-3" /> 퀵서비스 발송</span>
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={ticket.quickServiceNumber || ''} 
                                  onChange={e => handleQuickServiceUpdate(ticket.id, e.target.value)} 
                                  className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-slate-500 text-slate-900 dark:text-slate-100" 
                                  placeholder="기사님 번호 (예: 010-1234-5678)" 
                                />
                                <button 
                                  onClick={e => handleSendAlimtalk(e, ticket, 'QUICK')}
                                  disabled={loadingMap[`${ticket.id}_quick`] || !ticket.quickServiceNumber}
                                  className={`${
                                    ticket.quickServiceSent ? 'bg-slate-600 dark:bg-slate-500' : 
                                    ticket.quickSendFailed ? 'bg-red-500 hover:bg-red-600' : 
                                    'bg-slate-800'
                                  } text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors`}
                                >
                                  {loadingMap[`${ticket.id}_quick`] ? <Loader2 className="h-3 w-3 animate-spin"/> : (
                                    ticket.quickServiceSent ? <Check className="h-3 w-3"/> : 
                                    ticket.quickSendFailed ? <RotateCcw className="h-3 w-3"/> : 
                                    <MessageSquare className="h-3 w-3"/>
                                  )}
                                  {ticket.quickServiceSent ? '보냄' : ticket.quickSendFailed ? '재시도' : '전송'}
                                </button>
                              </div>
                           </div>
                        </div>
                    )}

                    {/* 입고 및 수리중 상태일 때 상세 증상과 점검요청 사항 표시 (기존 REPAIRING 조건에 ADMISSION 추가) */}
                    {(ticket.status === 'ADMISSION' || ticket.status === 'REPAIRING') && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* 상세 증상 박스 */}
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                           <span className="font-bold text-slate-400 block text-xs uppercase mb-1">상세 증상</span>
                           <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed min-h-[40px]">
                              {ticket.symptom || <span className="text-slate-300 dark:text-slate-600 italic">입력된 증상이 없습니다.</span>}
                           </p>
                        </div>
                        {/* 점검요청 사항 박스 */}
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                           <span className="font-bold text-slate-400 block text-xs uppercase mb-1">점검요청 사항</span>
                           <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed min-h-[40px]">
                              {ticket.requestNotes || <span className="text-slate-300 dark:text-slate-600 italic">추가 요청사항 없음</span>}
                           </p>
                        </div>
                      </div>
                    )}
                    
                    {/* 수리 처리 결과 입력 (수리완료, 보관함 상태에서 표시) - 확인 버튼 추가 */}
                    {(ticket.status === 'COMPLETION' || isArchived) && (
                       <div className="mb-4">
                          <span className="font-bold text-slate-400 block text-xs uppercase mb-1">수리 처리 결과</span>
                          <div className="relative">
                            <textarea
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-green-500 resize-none min-h-[80px] text-slate-900 dark:text-slate-100"
                                placeholder="수리 완료에 대한 상세 내용을 입력하세요."
                                value={ticket.repairResult || ''}
                                onChange={e => handleRepairResultUpdate(ticket.id, e.target.value)}
                            />
                            <button 
                                onClick={() => alert('내용이 저장되었습니다.')}
                                className="absolute right-2 bottom-2 bg-slate-800 dark:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-700 dark:hover:bg-slate-500 transition-colors shadow-sm active:scale-95"
                            >
                                확인
                            </button>
                          </div>
                       </div>
                    )}

                    {/* 수리 타임라인: 수리중, 수리완료, 보관함 탭에서 모두 표시 (접기/펼치기 가능) */}
                    {(ticket.status === 'REPAIRING' || ticket.status === 'COMPLETION' || isArchived) && (
                       <div className="border-t dark:border-slate-800 pt-4 mt-2">
                          <button 
                            onClick={() => toggleTimeline(ticket.id)}
                            className="w-full flex justify-between items-center text-left mb-2 group"
                          >
                             <span className="font-bold text-slate-400 text-xs uppercase flex items-center gap-1">
                               <Clock className="h-3 w-3" /> 수리 타임라인
                             </span>
                             <span className="text-xs text-slate-400 group-hover:text-blue-500 flex items-center gap-1 transition-colors">
                               {isTimelineOpen ? '접기' : '펼치기'} {isTimelineOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                             </span>
                          </button>
                          
                          {isTimelineOpen && (
                              <div className="animate-in slide-in-from-top-2 fade-in">
                                  <div className="max-h-40 overflow-y-auto space-y-2 mb-3 pr-2 scrollbar-thin" ref={(el) => { logListRefs.current[ticket.id] = el; }}>
                                     {ticket.repairLogs?.length ? ticket.repairLogs.map(log => (
                                       <div key={log.id} className="text-xs bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 flex justify-between items-center group">
                                         <div>
                                           <span className="text-indigo-400 font-bold mr-2">[{log.date}]</span>
                                           <span className="text-slate-600 dark:text-slate-300">{log.content}</span>
                                         </div>
                                       </div>
                                     )) : (
                                       <div className="text-xs text-slate-300 dark:text-slate-600 text-center py-4 italic">수리 기록이 없습니다.</div>
                                     )}
                                  </div>
                                  {/* 입력창은 수리중 상태이면서 보관되지 않은 경우에만 표시 */}
                                  {ticket.status === 'REPAIRING' && !isArchived && (
                                    <div className="flex gap-2">
                                       <input 
                                         className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100" 
                                         placeholder="기록 내용을 입력하세요..." 
                                         value={logInputs[ticket.id] || ''} 
                                         onChange={e => setLogInputs(p => ({...p, [ticket.id]: e.target.value}))} 
                                         onKeyDown={e => {
                                           if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                             e.preventDefault();
                                             handleAddLog(ticket.id);
                                           }
                                         }} 
                                       />
                                       <button onClick={() => handleAddLog(ticket.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-transform">기록</button>
                                    </div>
                                  )}
                              </div>
                          )}
                       </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                       <div className="flex items-center gap-4 text-[10px] text-slate-400">
                          <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />접수: {ticket.createdAt}</div>
                          {ticket.completionDate && <div className="flex items-center gap-1 text-green-500"><CheckCircle className="h-3 w-3" />완료: {new Date(ticket.completionDate).toLocaleDateString()}</div>}
                       </div>
                       <div className="flex gap-3">
                          <button onClick={() => openEditModal(ticket)} className="text-xs font-bold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"><Edit3 className="h-3 w-3" />수정</button>
                          <button onClick={e => handleDeleteClick(e, ticket.id)} className="text-xs font-bold text-slate-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors">
                            <Trash2 className="h-3 w-3" />{deleteConfirmId === ticket.id ? '확인' : '삭제'}
                          </button>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* --- ADMIN AUTH MODAL --- */}
      {isAdminAuthOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-[10000] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden p-8 transition-transform ${authError ? 'animate-bounce' : ''}`}>
             <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">관리자 인증</h3>
              <p className="text-sm text-slate-400 mt-1">데이터를 삭제하려면 비밀번호를 입력하세요.</p>
            </div>
            
            <form onSubmit={handleAdminAuth} className="space-y-4">
              <input 
                autoFocus
                type="password"
                placeholder="비밀번호 입력"
                className={`w-full bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl px-5 py-4 text-center text-xl font-bold tracking-widest outline-none transition-all text-slate-900 dark:text-white ${authError ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-100 dark:border-slate-700 focus:border-red-500'}`}
                value={adminPasswordInput}
                onChange={e => {
                  setAdminPasswordInput(e.target.value);
                  setAuthError(false);
                }}
              />
              
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsAdminAuthOpen(false);
                    setAdminPasswordInput('');
                    setPendingAction(null);
                  }}
                  className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Unlock className="h-4 w-4" /> 인증 및 삭제
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- WARNING MODAL (Fixed Z-Index) --- */}
      {warningModalTicketId && (
        <div className="fixed inset-0 bg-slate-900/60 z-[10001] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">알림톡 미발송 경고</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                알림톡을 보내지 않았습니다.<br/>계속하시겠습니까?
              </p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    const t = tickets.find(t => t.id === warningModalTicketId);
                    if(t) handleWarningSend(t);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-md shadow-blue-100 active:scale-[0.98] transition-all"
                >
                  알림톡 보내기
                </button>
                <button 
                  onClick={() => {
                    const t = tickets.find(t => t.id === warningModalTicketId);
                    if(t) handleWarningProceed(t);
                  }}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all"
                >
                  보내지 않고 진행하기
                </button>
                <button 
                  onClick={() => setWarningModalTicketId(null)}
                  className="mt-3 text-xs text-slate-400 hover:text-slate-600 font-medium underline underline-offset-4"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- NEW/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{editingTicketId ? '정보 수정' : '신규 접수'}</h2>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X className="h-6 w-6" /></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-4 scrollbar-thin">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">이름</label>
                   <div className="relative" ref={customerDropdownRef}>
                      <input 
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100" 
                          value={newData.customerName} 
                          onChange={e => handleInputChange('customerName', e.target.value)} 
                          onFocus={() => {
                              // 검색 결과가 있으면 드롭다운 열기
                              if (customerSearchResults.length > 0) setIsCustomerSearchOpen(true);
                          }}
                          placeholder="고객명 입력 (MySQL 검색)" 
                          autoComplete="off"
                      />
                      {/* 고객 검색 드롭다운 (검색 결과가 있을 때만 표시) */}
                      {isCustomerSearchOpen && customerSearchResults.length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                             {customerSearchResults.map((entry, idx) => (
                                <div 
                                    key={entry.id || idx} 
                                    className="px-4 py-3 text-sm border-b border-slate-50 dark:border-slate-700 last:border-0 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer transition-colors"
                                    onClick={() => selectCustomerFromDb(entry)}
                                >
                                   <div className="font-bold text-slate-800 dark:text-slate-200">{entry.고객명 || entry["customer_name"]} <span className="text-xs font-normal text-slate-400 ml-1">{entry.직위 || entry["position"]}</span></div>
                                   <div className="text-xs text-slate-500 mt-0.5">{entry.회사명 || entry["company_name"]}</div>
                                </div>
                             ))}
                          </div>
                      )}
                   </div>
                </div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">연락처</label><input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100" value={newData.phone} onChange={handlePhoneChange} placeholder="010-0000-0000" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">제품명</label>
                    <div className="space-y-2">
                      <div className="relative" ref={productDropdownRef}>
                        <div 
                            onClick={() => {
                                setIsProductSearchOpen(!isProductSearchOpen);
                                setProductSearchQuery('');
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between cursor-pointer focus:ring-2 focus:ring-blue-500 select-none text-slate-900 dark:text-slate-100"
                        >
                            <span className={!newData.productName && !isDirectInput ? "text-slate-400" : "text-slate-600 dark:text-slate-300"}>
                                {isDirectInput ? '기타 (직접 입력)' : (newData.productName || '제품 선택')}
                            </span>
                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isProductSearchOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isProductSearchOpen && (
                            <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-64 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                <div className="p-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                                     <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                        <input 
                                            autoFocus
                                            className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                                            placeholder="제품명 검색..."
                                            value={productSearchQuery}
                                            onChange={(e) => setProductSearchQuery(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                     </div>
                                </div>
                                <div className="overflow-y-auto flex-1 p-1 scrollbar-thin">
                                    {PRODUCT_LIST.filter(p => p.toLowerCase().includes(productSearchQuery.toLowerCase())).map((p) => (
                                        <div 
                                            key={p} 
                                            className={`px-3 py-2.5 text-sm rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${newData.productName === p && !isDirectInput ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                                            onClick={() => {
                                                setIsDirectInput(false);
                                                handleInputChange('productName', p);
                                                setIsProductSearchOpen(false);
                                            }}
                                        >
                                            {p}
                                        </div>
                                    ))}
                                    
                                    {PRODUCT_LIST.filter(p => p.toLowerCase().includes(productSearchQuery.toLowerCase())).length === 0 && (
                                       <div className="px-3 py-4 text-xs text-center text-slate-400 italic">
                                          검색 결과가 없습니다.
                                       </div>
                                    )}

                                    <div 
                                        className={`px-3 py-2.5 text-sm rounded-lg cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 transition-colors border-t border-slate-100 dark:border-slate-700 mt-1 ${isDirectInput ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}
                                        onClick={() => {
                                            setIsDirectInput(true);
                                            handleInputChange('productName', '');
                                            setIsProductSearchOpen(false);
                                        }}
                                    >
                                       <span className="flex items-center gap-2">
                                          <Edit3 className="h-3.5 w-3.5" />
                                          기타 (직접 입력)
                                       </span>
                                    </div>
                                </div>
                            </div>
                        )}
                      </div>
                      {isDirectInput && (
                        <input
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 animate-in fade-in slide-in-from-top-1 text-slate-900 dark:text-slate-100"
                          value={newData.productName}
                          onChange={e => handleInputChange('productName', e.target.value)}
                          placeholder="제품명을 직접 입력하세요"
                          autoFocus
                        />
                      )}
                    </div>
                 </div>
                 <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">S/N</label><input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100" value={newData.serial} onChange={e => handleInputChange('serial', e.target.value.slice(0, 9))} maxLength={9} placeholder="일련번호 (최대 9자리)" /></div>
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">주소</label><div className="flex gap-2"><input className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100" value={newData.address} onChange={e => handleInputChange('address', e.target.value)} placeholder="배송지 주소" /><button onClick={openAddressSearch} className="bg-slate-800 dark:bg-slate-700 text-white px-4 rounded-xl text-xs font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors">검색</button></div></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">구매처</label><input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100" value={newData.purchaseLocation} onChange={e => handleInputChange('purchaseLocation', e.target.value)} placeholder="구매처" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">증상</label><textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-900 dark:text-slate-100" value={newData.symptom} onChange={e => handleInputChange('symptom', e.target.value)} placeholder="증상을 상세히 적어주세요." /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">점검요청 사항</label><textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-900 dark:text-slate-100" value={newData.requestNotes || ''} onChange={e => handleInputChange('requestNotes', e.target.value)} placeholder="추가 점검 요청사항" /></div>
              </div>
            </div>
            <div className="p-8 border-t dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-950/50">
              <button onClick={closeModal} className="px-6 py-3.5 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">취소</button>
              <button onClick={handleSaveTicket} className="bg-blue-600 text-white px-10 py-3.5 rounded-2xl text-sm font-black shadow-lg shadow-blue-100 active:scale-95 transition-all">저장하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
