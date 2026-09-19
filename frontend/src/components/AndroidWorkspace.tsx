import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Play, RefreshCw, Download, Smartphone, Terminal, 
  Folder, FileCode, CheckCircle2, Search, Sparkles, Heart, 
  MessageSquare, Share2, Info, ChevronRight, Globe, Shield, 
  Settings, Check, CornerDownRight, Sprout, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

interface AndroidWorkspaceProps {
  onBack: () => void;
  currentLanguage: Language;
}

type AndroidFile = {
  name: string;
  path: string;
  type: 'kotlin' | 'gradle' | 'xml';
  content: string;
};

export const AndroidWorkspace: React.FC<AndroidWorkspaceProps> = ({ onBack, currentLanguage }) => {
  const [activeTab, setActiveTab] = useState<'emulator' | 'code'>('emulator');
  const [selectedFile, setSelectedFile] = useState<string>('MainActivity.kt');
  const [language, setLanguage] = useState<Language>(currentLanguage);
  
  // Compiler / Build states
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([
    "Welcome to Android SDK & Kotlin Build System",
    "Ready to compile AgroCare AI Native Project..."
  ]);
  const [apkCompiled, setApkCompiled] = useState(true);

  // Simulated Emulator interactive state
  const [emulatorScreen, setEmulatorScreen] = useState<'home' | 'scan' | 'market' | 'community'>('home');
  const [tempChecked, setTempChecked] = useState<boolean[]>([false, false, false]);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [votes, setVotes] = useState<number[]>([42, 118, 93]);
  const [votedIndex, setVotedIndex] = useState<number | null>(null);
  const [likes, setLikes] = useState<number[]>([15, 84, 29]);
  const [hasLiked, setHasLiked] = useState<boolean[]>([false, false, false]);

  // Virtual files representing actual project files in workspace
  const files: Record<string, AndroidFile> = {
    'MainActivity.kt': {
      name: 'MainActivity.kt',
      path: 'app/src/main/java/com/agrocare/ai/MainActivity.kt',
      type: 'kotlin',
      content: `package com.agrocare.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.navigation.compose.*
import com.agrocare.ai.ui.theme.AgroCareAITheme
import com.agrocare.ai.ui.screens.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AgroCareAITheme {
                MainAppScreen()
            }
        }
    }
}

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Home : Screen("home", "Home", Icons.Default.Home)
    object Diagnosis : Screen("diagnosis", "Scan", Icons.Default.PlayArrow)
    object Market : Screen("market", "Market", Icons.Default.List)
    object Community : Screen("community", "Community", Icons.Default.Share)
}

@Composable
fun MainAppScreen() {
    val navController = rememberNavController()
    val items = listOf(Screen.Home, Screen.Diagnosis, Screen.Market, Screen.Community)

    Scaffold(
        bottomBar = {
            NavigationBar(containerColor = MaterialTheme.colorScheme.surfaceVariant) {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route
                items.forEach { screen ->
                    NavigationBarItem(
                        icon = { Icon(screen.icon, contentDescription = screen.title) },
                        label = { Text(screen.title) },
                        selected = currentRoute == screen.route,
                        onClick = {
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.startDestinationId) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { paddingValues ->
        NavHost(navController, startDestination = Screen.Home.route, Modifier.padding(paddingValues)) {
            composable(Screen.Home.route) { HomeScreen({ navController.navigate(Screen.Diagnosis.route) }) }
            composable(Screen.Diagnosis.route) { DiagnosisScreen() }
            composable(Screen.Market.route) { MarketScreen() }
            composable(Screen.Community.route) { CommunityScreen() }
        }
    }
}`
    },
    'HomeScreen.kt': {
      name: 'HomeScreen.kt',
      path: 'app/src/main/java/com/agrocare/ai/ui/screens/HomeScreen.kt',
      type: 'kotlin',
      content: `package com.agrocare.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun HomeScreen(onNavigateToDiagnosis: () -> Unit) {
    Column(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background).verticalScroll(rememberScrollState()).padding(16.dp)) {
        Text("AgroCare AI", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        Text("Your Smart Farming Companion", fontSize = 12.sp, color = MaterialTheme.colorScheme.onBackground.copy(0.6f))
        
        Spacer(Modifier.height(16.dp))
        
        Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(24.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
            Column(Modifier.padding(20.dp)) {
                Text("REAL-TIME DIAGNOSIS", fontWeight = FontWeight.Black, fontSize = 11.sp, color = MaterialTheme.colorScheme.primary)
                Text("Scan Leaves for Diseases", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(8.dp))
                Button(onClick = onNavigateToDiagnosis) {
                    Text("Launch Scanner")
                }
            }
        }
    }
}`
    },
    'DiagnosisScreen.kt': {
      name: 'DiagnosisScreen.kt',
      path: 'app/src/main/java/com/agrocare/ai/ui/screens/DiagnosisScreen.kt',
      type: 'kotlin',
      content: `package com.agrocare.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun DiagnosisScreen() {
    var isScanning by remember { mutableStateOf(false) }
    var scanResult by remember { mutableStateOf<String?>(null) }

    Column(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background).padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text("AI Crop Diagnosis", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        
        Box(Modifier.fillMaxWidth().weight(1f).background(Color.Black), contentAlignment = Alignment.Center) {
            if (isScanning) {
                CircularProgressIndicator()
            } else if (scanResult != null) {
                Text("Result: Tomato Early Blight", color = Color.White)
            } else {
                Button(onClick = { isScanning = true }) { Text("Trigger Camera Scan") }
            }
        }
    }
}`
    },
    'Theme.kt': {
      name: 'Theme.kt',
      path: 'app/src/main/java/com/agrocare/ai/ui/theme/Theme.kt',
      type: 'kotlin',
      content: `package com.agrocare.ai.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF2E7D32), // Custom Emerald Green
    secondary = Color(0xFF4CAF50),
    tertiary = Color(0xFF81C784),
    background = Color(0xFFFCFDF9)
)

@Composable
fun AgroCareAITheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        content = content
    )
}`
    },
    'build.gradle.kts': {
      name: 'build.gradle.kts',
      path: 'app/build.gradle.kts',
      type: 'gradle',
      content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android") version "2.2.10"
    id("com.google.android.libraries.mapsplatform.secrets-gradle-plugin") version "2.0.1"
}

android {
    namespace = "com.agrocare.ai"
    compileSdk = 36
    defaultConfig {
        applicationId = "com.agrocare.ai"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "2.2.10"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
}`
    },
    'AndroidManifest.xml': {
      name: 'AndroidManifest.xml',
      path: 'app/src/main/AndroidManifest.xml',
      type: 'xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

    <application
        android:allowBackup="true"
        android:label="AgroCare AI"
        android:theme="@style/Theme.Material3.DayNight.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`
    }
  };

  const runGradleBuild = () => {
    setIsBuilding(true);
    setApkCompiled(false);
    setBuildLogs([
      "Initializing Gradle Daemon...",
      "Gradle Daemon started successfully in 640 ms",
      "Analyzing project dependencies...",
      "Resolving repository dependencies: google, mavenCentral...",
      "Linking Gradle Modules: :app (Android 36 / Kotlin 2.2.10)",
      "> Task :app:preBuild UP-TO-DATE",
      "> Task :app:generateDebugBuildConfig SUCCESS (180ms)",
      "> Task :app:javaPreCompileDebug SUCCESS (90ms)",
      "> Task :app:compileDebugKotlin"
    ]);

    let logCounter = 0;
    const interval = setInterval(() => {
      const extraLogs = [
        "  └─ Parsing Jetpack Compose Compiler Extension (version 2.2.10)",
        "  └─ Inline optimizations for MainActivity.kt...",
        "> Task :app:compileDebugJavaWithJavac SUCCESS (210ms)",
        "> Task :app:mergeDebugResources SUCCESS (120ms)",
        "> Task :app:processDebugResources SUCCESS (90ms)",
        "> Task :app:assembleDebug SUCCESS (310ms)",
        "Signing debug application bundle with debug.keystore...",
        "Verification complete for output: app/build/outputs/apk/debug/app-debug.apk",
        "BUILD SUCCESSFUL in 1.85 seconds",
        "Preparing APK for target Emulator deployment...",
        "Device Pixel 9 Pro connected. Installing com.agrocare.ai...",
        "Launch Activity: com.agrocare.ai/.MainActivity"
      ];

      if (logCounter < extraLogs.length) {
        setBuildLogs(prev => [...prev, extraLogs[logCounter]]);
        logCounter++;
      } else {
        clearInterval(interval);
        setIsBuilding(false);
        setApkCompiled(true);
      }
    }, 250);
  };

  // Translations
  const trans = {
    en: {
      title: "Android Native Workspace",
      sub: "Inspect the native Android Kotlin source code and run the Jetpack Compose app emulator live.",
      runBtn: "Compile & Run App",
      running: "Compiling Gradle...",
      buildSuccess: "APK Built Successfully",
      back: "Back to Web App",
      codeHeader: "Source Code Explorer",
      emuHeader: "Live Android Emulator",
      setup: "Gradle Settings",
      mandi: "APMC Mandi",
      todayCheck: "Today's Farm Tasks",
      recommendations: "Farming Actions",
      diseaseHeader: "AI Leaf Diagnostics",
      diseaseDesc: "Place an infected leaf within the reticle to run diagnostic model reports.",
      tapScan: "TAP TO TRIGGER SCAN",
      scanning: "Analyzing Foliage...",
      doneScan: " Tomato Early Blight",
      scannedResult: "Concentric black spots with yellow halos. Fungal infection caused by Alternaria solani.",
      treatment: "Organic Copper Fungicide, remove lower leaves, water at root bases.",
      marketPrice: "Real-time Mandi Rates",
      commFeed: "Agriculture Forum Feed"
    },
    hi: {
      title: "एंड्रॉइड नेटिव वर्कस्पेस",
      sub: "एंड्रॉइड कोटलिन सोर्स कोड का निरीक्षण करें और जेटपैक कंपोज ऐप एमुलेटर चलाएं।",
      runBtn: "कंपाइल और रन करें",
      running: "ग्रेडल कंपाइल हो रहा है...",
      buildSuccess: "APK सफलतापूर्वक बन गया",
      back: "वेब ऐप पर वापस जाएं",
      codeHeader: "सोर्स कोड एक्सप्लोरर",
      emuHeader: "लाइव एंड्रॉइड एमुलेटर",
      setup: "ग्रेडल सेटिंग्स",
      mandi: "कृषि मंडी",
      todayCheck: "आज के कृषि कार्य",
      recommendations: "कृषि क्रियाएं",
      diseaseHeader: "एआई पत्ती रोग निदान",
      diseaseDesc: "पत्ती के संक्रमित हिस्से को फ्रेम में लाएं और विश्लेषण करें।",
      tapScan: "स्कैन शुरू करने के लिए टैप करें",
      scanning: "पत्ती का विश्लेषण हो रहा है...",
      doneScan: " टमाटर अगेती झुलसा",
      scannedResult: "पीले घेरे वाले काले धब्बे। अल्टरनेरिया सोलानी कवक के कारण संक्रमण।",
      treatment: "तांबा कवकनाशी का छिड़काव, निचली पत्तियां हटाएं, जड़ों में पानी दें।",
      marketPrice: "मंडी की ताजा कीमतें",
      commFeed: "किसान समुदाय फोरम"
    },
    kn: {
      title: "ಆಂಡ್ರಾಯ್ಡ್ ನೇಟಿವ್ ವರ್ಕ್‌ಸ್ಪೇಸ್",
      sub: "ಆಂಡ್ರಾಯ್ಡ್ ಕೋಟ್ಲಿನ್ ಸೋರ್ಸ್ ಕೋಡ್ ವೀಕ್ಷಿಸಿ ಮತ್ತು ಜೆಟ್‌ಪ್ಯಾಕ್ ಕಂಪೋಸ್ ಎಮ್ಯುಲೇಟರ್ ಚಲಾಯಿಸಿ.",
      runBtn: "ಕಂಪೈಲ್ ಮಾಡಿ ಚಲಾಯಿಸಿ",
      running: "ಗ್ರೇಡಲ್ ಕಂಪೈಲ್ ಆಗುತ್ತಿದೆ...",
      buildSuccess: "APK ಯಶಸ್ವಿಯಾಗಿ ನಿರ್ಮಾಣಗೊಂಡಿದೆ",
      back: "ವೆಬ್ ಆಪ್‌ಗೆ ಹಿಂತಿರುಗಿ",
      codeHeader: "ಸೋರ್ಸ್ ಕೋಡ್ ಎಕ್ಸ್‌ಪ್ಲೋರರ್",
      emuHeader: "ಲೈವ್ ಆಂಡ್ರಾಯ್ಡ್ ಎಮ್ಯುಲೇಟರ್",
      setup: "ಗ್ರೇಡಲ್ ಸೆಟ್ಟಿಂಗ್ಸ್",
      mandi: "ಕೃಷಿ ಮಾರುಕಟ್ಟೆ",
      todayCheck: "ಇಂದಿನ ಕೃಷಿ ಕೆಲಸಗಳು",
      recommendations: "ಕೃಷಿ ಕ್ರಮಗಳು",
      diseaseHeader: "ಎಐ ಎಲೆ ರೋಗ ತಪಾಸಣೆ",
      diseaseDesc: "ಸೋಂಕಿತ ಎಲೆಯನ್ನು ಚೌಕಟ್ಟಿನಲ್ಲಿ ಇರಿಸಿ ತಪಾಸಣೆ ನಡೆಸಿ.",
      tapScan: "ಸ್ಕ್ಯಾನ್ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
      scanning: "ಎಲೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
      doneScan: " ಟೊಮೆಟೊ ಮುಂಗಾರು ರೋಗ",
      scannedResult: "ಕಪ್ಪು ಕಲೆಗಳು ಮತ್ತು ಹಳದಿ ವಲಯ. ಆಲ್ಟರ್ನೇರಿಯಾ ಸೋಲಾನಿ ಶಿಲೀಂಧ್ರದಿಂದ ಉಂಟಾದ ಸೋಂಕು.",
      treatment: "ತಾಮ್ರದ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಿ, ಕೆಳಗಿನ ಎಲೆಗಳನ್ನು ತೆಗೆಯಿರಿ, ಬುಡಕ್ಕೆ ನೀರು ಹಾಕಿ.",
      marketPrice: "ಮಾರುಕಟ್ಟೆಯ ಇಂದಿನ ಬೆಲೆಗಳು",
      commFeed: "ರೈತ ಒಕ್ಕೂಟ ವೇದಿಕೆ"
    }
  };

  const t = trans[language] || trans.en;

  const handleToggleTask = (idx: number) => {
    setTempChecked(prev => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
  };

  const triggerScan = () => {
    setScanState('scanning');
    setTimeout(() => {
      setScanState('done');
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#0F110F] text-gray-200 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Background elegant gradient elements */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#152315] to-transparent opacity-40 pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0" />
      
      {/* HEADER BAR */}
      <header className="border-b border-neutral-800 bg-[#0F110F]/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 z-10">
          <button 
            onClick={onBack}
            className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-gray-400 hover:text-white transition-all flex items-center justify-center cursor-pointer"
            style={{ minWidth: '40px', minHeight: '40px' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-primary/20 text-primary border border-primary/30 text-[10px] uppercase tracking-widest font-black px-2.5 py-0.5 rounded-full">
                Native App SDK
              </span>
              <span className="text-[10px] text-gray-500 font-mono font-bold">Target SDK: 36 (Kotlin)</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight mt-0.5">{t.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap z-10">
          {/* Language selection inside Android screen */}
          <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl p-1">
            <button 
              onClick={() => setLanguage('en')}
              className={`text-xs px-3 py-1.5 rounded-lg font-black tracking-wide transition-all ${language === 'en' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('hi')}
              className={`text-xs px-3 py-1.5 rounded-lg font-black tracking-wide transition-all ${language === 'hi' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
            >
              हिन्दी
            </button>
            <button 
              onClick={() => setLanguage('kn')}
              className={`text-xs px-3 py-1.5 rounded-lg font-black tracking-wide transition-all ${language === 'kn' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
            >
              ಕನ್ನಡ
            </button>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={runGradleBuild}
            disabled={isBuilding}
            className="bg-primary hover:bg-primary-dark text-white font-black text-xs px-5 py-3 rounded-xl shadow-[0_4px_20px_rgba(46,125,50,0.3)] flex items-center gap-2 cursor-pointer border border-primary/20"
            style={{ minHeight: '40px' }}
          >
            {isBuilding ? <RefreshCw size={15} className="animate-spin" /> : <Play size={15} fill="white" />}
            <span>{isBuilding ? t.running : t.runBtn}</span>
          </motion.button>

          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer"
            className="bg-neutral-900 hover:bg-neutral-800 text-gray-300 font-black text-xs px-4 py-3 rounded-xl border border-neutral-800 flex items-center gap-2 cursor-pointer hover:text-white transition-all"
            style={{ minHeight: '40px' }}
          >
            <Download size={15} />
            <span>Export Project</span>
          </a>
        </div>
      </header>

      {/* SUB-HEADER / WORKSPACE PATHS */}
      <div className="bg-[#121512] px-6 py-2.5 border-b border-neutral-800 flex items-center gap-2 text-xs text-gray-500 font-mono overflow-x-auto whitespace-nowrap z-10">
        <Folder size={13} className="text-primary" />
        <span>AgroCareAI</span>
        <ChevronRight size={12} />
        <span>app</span>
        <ChevronRight size={12} />
        <span>src</span>
        <ChevronRight size={12} />
        <span>main</span>
        <ChevronRight size={12} />
        <span>java</span>
        <ChevronRight size={12} />
        <span>com</span>
        <ChevronRight size={12} />
        <span>agrocare</span>
        <ChevronRight size={12} />
        <span>ai</span>
        <ChevronRight size={12} />
        <span className="text-gray-300 font-semibold">{files[selectedFile]?.name}</span>
      </div>

      {/* CORE WORKSPACE PANELS */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden z-10">
        
        {/* PANEL 1: FILE EXPLORER SIDEBAR (2 columns) */}
        <div className="lg:col-span-2 border-r border-neutral-800 bg-[#0C0E0C] p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="text-xs font-black tracking-widest text-gray-400 uppercase">
            Project Tree
          </div>
          
          <div className="flex flex-col gap-1.5 text-xs font-medium">
            <div className="flex items-center gap-2 text-gray-400 p-1.5">
              <Folder size={14} className="text-primary" />
              <span className="font-bold">AgroCareAI</span>
            </div>
            
            <div className="pl-4 flex flex-col gap-1 border-l border-neutral-800/80">
              <div className="flex items-center gap-2 text-gray-400 p-1">
                <Folder size={13} className="text-amber-500" />
                <span className="font-semibold">gradle</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-400 p-1">
                <Folder size={13} className="text-emerald-500" />
                <span className="font-bold">app</span>
              </div>
              
              <div className="pl-4 flex flex-col gap-1 border-l border-neutral-800/80">
                <div className="flex items-center gap-2 text-gray-500 p-1">
                  <Folder size={13} />
                  <span>src/main</span>
                </div>
                
                <div className="pl-4 flex flex-col gap-0.5 border-l border-neutral-800/80">
                  <div className="flex items-center gap-2 text-gray-400 p-1 bg-neutral-900/50 rounded-lg">
                    <Folder size={13} className="text-primary" />
                    <span className="font-bold">java/com/agrocare/ai</span>
                  </div>

                  <div className="pl-4 flex flex-col gap-1 border-l border-neutral-800/80">
                    {/* File entries */}
                    {Object.keys(files).filter(k => files[k].type === 'kotlin').map((fileName) => (
                      <button
                        key={fileName}
                        onClick={() => setSelectedFile(fileName)}
                        className={`flex items-center gap-2 p-1.5 rounded-lg text-left w-full cursor-pointer transition-all ${
                          selectedFile === fileName 
                            ? 'bg-primary/10 text-primary font-black' 
                            : 'text-gray-400 hover:text-white hover:bg-neutral-900'
                        }`}
                      >
                        <FileCode size={13} />
                        <span className="truncate">{fileName}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedFile('AndroidManifest.xml')}
                    className={`flex items-center gap-2 p-1.5 mt-1.5 pl-4 rounded-lg text-left w-full cursor-pointer transition-all ${
                      selectedFile === 'AndroidManifest.xml' 
                        ? 'bg-primary/10 text-primary font-black' 
                        : 'text-gray-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <FileCode size={13} className="text-blue-400" />
                    <span className="truncate">AndroidManifest.xml</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedFile('build.gradle.kts')}
                  className={`flex items-center gap-2 p-1.5 mt-1.5 pl-4 rounded-lg text-left w-full cursor-pointer transition-all ${
                    selectedFile === 'build.gradle.kts' 
                      ? 'bg-primary/10 text-primary font-black' 
                      : 'text-gray-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <FileCode size={13} className="text-amber-400" />
                  <span className="truncate">build.gradle.kts</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-neutral-800/60 text-[11px] text-gray-500 leading-relaxed">
            <span className="font-bold text-gray-400 block mb-1">Android Studio Setup:</span>
            To run this native project locally, click "Export Project" above, download the ZIP archive, and unzip. In Android Studio, select "Open Project" and choose the unzipped root directory.
          </div>
        </div>

        {/* PANEL 2: CODE EDITOR (6 columns) */}
        <div className="lg:col-span-6 bg-[#0E100E] border-r border-neutral-800 flex flex-col overflow-hidden">
          {/* Editor Header tabs */}
          <div className="border-b border-neutral-800/80 bg-[#0B0D0B] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <FileCode size={14} className="text-primary animate-pulse" />
              <span>{files[selectedFile]?.path}</span>
            </div>
            <div className="text-[10px] font-mono bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-md text-gray-500">
              Kotlin DSL • UTF-8
            </div>
          </div>

          {/* Actual Code Viewer with styled textareas resembling real IDE highlight */}
          <div className="flex-1 p-5 font-mono text-[13px] leading-relaxed overflow-y-auto bg-neutral-950/80 relative">
            <div className="absolute top-0 left-0 w-12 h-full bg-[#0B0D0B]/40 border-r border-neutral-800/30 select-none text-right pr-3 pt-5 text-gray-600 text-xs flex flex-col gap-0.5">
              {Array.from({ length: files[selectedFile]?.content.split('\n').length || 1 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            <pre className="pl-10 text-[#A9B7C6] whitespace-pre-wrap break-all select-text font-mono selection:bg-primary/30">
              {files[selectedFile]?.content.split('\n').map((line, idx) => {
                // Highly basic but visually stunning inline highlighter mock
                let highlighted: React.ReactNode = line;
                if (line.trim().startsWith('package') || line.trim().startsWith('import')) {
                  highlighted = <span className="text-orange-400">{line}</span>;
                } else if (line.includes('class ') || line.includes('fun ') || line.includes('sealed ') || line.includes('object ')) {
                  const parts = line.split(' ');
                  highlighted = (
                    <span>
                      {parts.map((p, i) => {
                        if (p === 'class' || p === 'fun' || p === 'sealed' || p === 'object' || p === 'override' || p === 'val' || p === 'var' || p === 'import' || p === 'package') {
                          return <span key={i} className="text-orange-400 font-bold">{p} </span>;
                        }
                        if (p.startsWith('HomeScreen') || p.startsWith('DiagnosisScreen') || p.startsWith('MarketScreen') || p.startsWith('CommunityScreen')) {
                          return <span key={i} className="text-emerald-300 font-semibold">{p} </span>;
                        }
                        return <span key={i}>{p} </span>;
                      })}
                    </span>
                  );
                } else if (line.includes('//')) {
                  highlighted = <span className="text-gray-500 italic">{line}</span>;
                } else if (line.includes('"')) {
                  highlighted = <span className="text-green-300">{line}</span>;
                }
                return (
                  <div key={idx} className="hover:bg-neutral-900/30 px-1 rounded transition-colors">
                    {highlighted}
                  </div>
                );
              })}
            </pre>
          </div>

          {/* PANEL 4: GRADLE LOGS / BUILD CONSOLE (attached below code) */}
          <div className="h-48 border-t border-neutral-800 bg-[#090A09] flex flex-col overflow-hidden">
            <div className="border-b border-neutral-800/60 bg-[#0B0C0B] px-4 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-400 font-mono">
                <Terminal size={14} className="text-primary" />
                <span>Gradle Build Console</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isBuilding ? 'bg-amber-400 animate-ping' : apkCompiled ? 'bg-green-400' : 'bg-neutral-600'}`}></span>
                <span className="text-[10px] uppercase font-bold text-gray-500 font-mono">
                  {isBuilding ? 'Building...' : apkCompiled ? 'Build Finished' : 'Idle'}
                </span>
              </div>
            </div>
            
            <div className="flex-1 p-4 font-mono text-[11px] text-green-400/80 overflow-y-auto flex flex-col gap-1 bg-[#050605]">
              {buildLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={`${log.includes('BUILD SUCCESSFUL') ? 'text-green-300 font-black bg-green-950/20 py-1 px-2 rounded border border-green-900/40' : log.includes('error') || log.includes('failed') ? 'text-red-400 font-bold' : log.includes('>') ? 'text-gray-400' : 'text-emerald-400/70'}`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL 3: NATIVE EMULATOR VIEW (4 columns) */}
        <div className="lg:col-span-4 bg-[#0A0B0A] p-6 flex flex-col items-center justify-center overflow-y-auto">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-bold tracking-widest uppercase mb-1">
              <Smartphone size={14} className="text-primary animate-pulse" />
              <span>{t.emuHeader}</span>
            </div>
            <p className="text-[11px] text-gray-500">Pixel 9 Pro • Android API 36</p>
          </div>

          {/* EMULATOR CELLPHONE FRAME */}
          <div className="relative w-[320px] h-[640px] rounded-[52px] border-[14px] border-[#1D211D] bg-neutral-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] outline outline-2 outline-neutral-800/50 flex flex-col overflow-hidden select-none">
            
            {/* Speaker & Sensor Notch Grill */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-[#1D211D] rounded-b-[24px] z-50 flex items-center justify-center">
              <div className="w-16 h-1 bg-[#2C312C] rounded-full mb-1" />
              <div className="absolute right-4 w-2 h-2 bg-[#2C312C] rounded-full mb-1" />
            </div>

            {/* Simulated Android System Status Bar */}
            <div className="h-9 pt-3 px-6 flex justify-between items-center text-[10px] font-black tracking-wider text-black bg-emerald-50/90 z-40">
              <span className="font-semibold text-emerald-900">10:35 AM</span>
              <div className="flex items-center gap-1.5 text-emerald-900">
                <Globe size={10} strokeWidth={2.5} />
                <span className="text-[9px] font-bold">5G</span>
                <div className="w-5 h-2.5 border border-emerald-900 rounded-[3px] p-[1px] flex items-center">
                  <div className="h-full w-full bg-emerald-900 rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* SCREEN INNER STAGE AREA */}
            <div className="flex-1 flex flex-col bg-neutral-100 relative">
              <AnimatePresence mode="wait">
                {isBuilding ? (
                  /* Gradle Compiling splash */
                  <motion.div 
                    key="compiling-splash"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-neutral-900 z-50 flex flex-col items-center justify-center p-6 text-center text-white"
                  >
                    <RefreshCw size={44} className="text-primary animate-spin mb-4" />
                    <h3 className="text-md font-bold tracking-tight">Installing APK</h3>
                    <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-mono">
                      gradle assembleDebug<br/>
                      adb install -r app-debug.apk
                    </p>
                  </motion.div>
                ) : !apkCompiled ? (
                  /* App turned off stage */
                  <motion.div 
                    key="off-splash"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center text-center p-6"
                  >
                    <Smartphone size={36} className="text-neutral-700 mb-3" />
                    <p className="text-xs font-bold text-neutral-500">App Offline</p>
                    <p className="text-[10px] text-neutral-600 mt-1 max-w-[180px]">
                      Click 'Compile & Run App' to boot native Android Compose stack.
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* EMULATOR APP VIEW */}
              <div className="flex-1 flex flex-col text-neutral-800 overflow-y-auto pb-16">
                
                {/* Home Screen View */}
                {emulatorScreen === 'home' && (
                  <div className="p-4 flex flex-col gap-4 animate-fadeIn">
                    <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-neutral-100">
                      <div>
                        <h2 className="text-sm font-black text-emerald-800">AgroCare AI</h2>
                        <p className="text-[10px] text-gray-500">Kotlin Native / Material 3</p>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                    </div>

                    {/* Scanner Hero banner */}
                    <div className="bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white p-4 rounded-2xl shadow-[0_6px_15px_rgba(46,125,50,0.15)] flex flex-col gap-1.5">
                      <div className="flex items-center gap-1">
                        <Sparkles size={11} className="text-emerald-300" />
                        <span className="text-[9px] uppercase font-black tracking-widest text-emerald-200">Real-Time scan</span>
                      </div>
                      <h3 className="text-xs font-black leading-tight">Gemini Leaf Diagnostics</h3>
                      <p className="text-[10px] text-emerald-100/70 leading-relaxed">
                        Detect plant diseases instantly using AI models with camera feed.
                      </p>
                      <button 
                        onClick={() => setEmulatorScreen('scan')}
                        className="bg-white text-emerald-800 font-black text-[10px] px-3.5 py-1.5 rounded-lg mt-1 w-fit cursor-pointer active:scale-95 transition-transform"
                      >
                        Scan Crop Now
                      </button>
                    </div>

                    {/* Today Farm list checklist */}
                    <div className="flex flex-col gap-1.5">
                      <h4 className="text-xs font-bold text-gray-700 px-1">{t.todayCheck}</h4>
                      
                      {/* Interactive lists */}
                      {[
                        ["Fungicide on tomato plants", "Urgent - early blight"],
                        ["South field blocks irrigation", "Scheduled dry check"],
                        ["Verify market paddy rates", "Routine APMC"]
                      ].map((item, idx) => {
                        const title = item[0];
                        const details = item[1];
                        const isChecked = tempChecked[idx];
                        return (
                          <div 
                            key={idx} 
                            onClick={() => handleToggleTask(idx)}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isChecked ? 'bg-green-50/50 border-green-200 text-gray-400' : 'bg-white border-neutral-100 hover:border-neutral-200'}`}
                          >
                            <div>
                              <p className={`text-[11px] font-bold ${isChecked ? 'line-through' : 'text-gray-800'}`}>{title}</p>
                              <p className="text-[9px] text-gray-500 mt-0.5">{details}</p>
                            </div>
                            <div className={`w-4.5 h-4.5 border rounded flex items-center justify-center transition-all ${isChecked ? 'bg-green-600 border-green-600 text-white' : 'border-neutral-300'}`}>
                              {isChecked && <Check size={10} strokeWidth={3} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Weather widget */}
                    <div className="bg-white p-3 rounded-2xl border border-neutral-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold text-sm">
                          ☀️
                        </div>
                        <div>
                          <p className="text-[11px] font-bold">Kolar, Karnataka</p>
                          <p className="text-[9px] text-gray-400">Sunny • humidity 60%</p>
                        </div>
                      </div>
                      <span className="text-md font-extrabold text-emerald-800">32°C</span>
                    </div>

                  </div>
                )}

                {/* Scan Disease Screen View */}
                {emulatorScreen === 'scan' && (
                  <div className="p-4 flex flex-col gap-4 h-full animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-emerald-800 tracking-wider uppercase">{t.diseaseHeader}</h3>
                      <button 
                        onClick={() => setEmulatorScreen('home')}
                        className="text-[10px] font-bold text-gray-500 hover:text-gray-800"
                      >
                        Close
                      </button>
                    </div>

                    {/* Real-time scanning viewport frame mock */}
                    <div className="relative aspect-[4/3] bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center">
                      
                      {scanState === 'idle' && (
                        <div className="text-center p-4">
                          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white/50 mx-auto mb-2.5 animate-pulse">
                            📷
                          </div>
                          <p className="text-[10px] text-neutral-400 font-semibold">{t.diseaseDesc}</p>
                          <button 
                            onClick={triggerScan}
                            className="mt-3.5 bg-emerald-600 text-white font-black text-[9px] px-3.5 py-1.5 rounded-lg tracking-wider uppercase cursor-pointer"
                          >
                            {t.tapScan}
                          </button>
                        </div>
                      )}

                      {scanState === 'scanning' && (
                        <div className="text-center">
                          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                          <p className="text-[10px] text-emerald-400 font-black animate-pulse uppercase tracking-wider">{t.scanning}</p>
                        </div>
                      )}

                      {scanState === 'done' && (
                        <div className="absolute inset-0 bg-[#141A14] p-4 flex flex-col justify-between text-white">
                          <div>
                            <div className="flex items-center gap-1 text-[9px] text-green-400 font-bold tracking-widest uppercase mb-1">
                              <CheckCircle2 size={10} className="text-green-400" />
                              <span>{t.doneScan}</span>
                            </div>
                            <h4 className="text-xs font-black text-white">Tomato Early Blight</h4>
                            <p className="text-[9px] text-neutral-300 leading-relaxed mt-1">{t.scannedResult}</p>
                          </div>
                          
                          <div className="border-t border-neutral-800 pt-2">
                            <h5 className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Treatments:</h5>
                            <p className="text-[9px] text-neutral-400 leading-relaxed mt-0.5">{t.treatment}</p>
                          </div>

                          <button 
                            onClick={() => setScanState('idle')}
                            className="bg-white/10 hover:bg-white/20 text-white font-bold text-[9px] px-3 py-1 rounded-md mt-1 cursor-pointer"
                          >
                            Rescan Leaf
                          </button>
                        </div>
                      )}

                      {/* Viewfinder brackets */}
                      {scanState === 'idle' && (
                        <>
                          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-white/40" />
                          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-white/40" />
                          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-white/40" />
                          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-white/40" />
                        </>
                      )}
                    </div>

                    {/* Calibration logs info card */}
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-start gap-2">
                      <Info size={14} className="text-emerald-700 mt-0.5" />
                      <p className="text-[9px] text-emerald-800 leading-relaxed font-medium">
                        Compose MainActivity binds camera sessions directly to standard CameraX API configurations. Models analyze local image buffers directly via the GoogleGenAI Android SDK.
                      </p>
                    </div>
                  </div>
                )}

                {/* Market Screen View */}
                {emulatorScreen === 'market' && (
                  <div className="p-4 flex flex-col gap-3 animate-fadeIn">
                    <h3 className="text-xs font-black text-emerald-800 tracking-wider uppercase">{t.marketPrice}</h3>
                    
                    {/* Search bar */}
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Search crop mandi..." 
                        disabled 
                        className="w-full bg-white border border-neutral-200 text-[10px] py-1.5 pl-7 pr-3 rounded-xl"
                      />
                      <Search size={10} className="absolute left-2.5 top-2.5 text-gray-400" />
                    </div>

                    {/* Mandi items list */}
                    {[
                      { name: "Paddy (Rice)", price: "₹2,350 / quintal", location: "Kolar Mandi", trend: "up" },
                      { name: "Tomato", price: "₹1,800 / quintal", location: "Chikkaballapur", trend: "down" },
                      { name: "Onion", price: "₹2,100 / quintal", location: "Yeshwanthpur", trend: "stable" }
                    ].map((crop, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-neutral-100 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-bold text-gray-800">{crop.name}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">{crop.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-black text-emerald-800">{crop.price}</p>
                          <span className={`text-[8px] font-bold uppercase ${crop.trend === 'up' ? 'text-green-600' : crop.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                            {crop.trend === 'up' ? '▲ +1.5%' : crop.trend === 'down' ? '▼ -2.8%' : '• stable'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Community Feed View */}
                {emulatorScreen === 'community' && (
                  <div className="p-4 flex flex-col gap-3 animate-fadeIn">
                    <h3 className="text-xs font-black text-emerald-800 tracking-wider uppercase">{t.commFeed}</h3>

                    {/* Forum Posts */}
                    {[
                      { title: "Best fungicide for tomato blight?", author: "Rajesh S.", time: "2 hrs ago", tag: "Tomato" },
                      { title: "Drip irrigation subsidy application open in Mandya", author: "Ganesh K.", time: "1 day ago", tag: "Subsidy" },
                      { title: "Organic manure preparation recipes", author: "Shivappa", time: "3 days ago", tag: "Organic" }
                    ].map((post, idx) => {
                      const isVoted = votedIndex === idx;
                      const hasL = hasLiked[idx];
                      return (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-neutral-100 flex flex-col gap-2 shadow-xs">
                          <div>
                            <span className="bg-emerald-50 text-emerald-700 font-bold text-[8px] px-1.5 py-0.5 rounded-md uppercase">
                              {post.tag}
                            </span>
                            <h4 className="text-[11px] font-bold text-gray-800 mt-1">{post.title}</h4>
                            <p className="text-[9px] text-gray-400 mt-0.5">{post.author} • {post.time}</p>
                          </div>
                          
                          {/* Feed post action bar inside phone */}
                          <div className="flex gap-4 border-t border-neutral-50/80 pt-2">
                            <button 
                              onClick={() => {
                                setLikes(prev => {
                                  const c = [...prev];
                                  c[idx] = hasL ? c[idx] - 1 : c[idx] + 1;
                                  return c;
                                });
                                setHasLiked(prev => {
                                  const c = [...prev];
                                  c[idx] = !c[idx];
                                  return c;
                                });
                              }}
                              className={`flex items-center gap-1 text-[9px] ${hasL ? 'text-red-500 font-bold' : 'text-gray-400'}`}
                            >
                              <Heart size={10} fill={hasL ? 'red' : 'none'} />
                              <span>{likes[idx]}</span>
                            </button>
                            <div className="flex items-center gap-1 text-[9px] text-gray-400">
                              <MessageSquare size={10} />
                              <span>{idx * 2 + 3} comments</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

              {/* SIMULATED DEVICE NAVIGATION CONTROLS */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-neutral-100 grid grid-cols-4 items-center px-2 shadow-lg z-40">
                <button 
                  onClick={() => setEmulatorScreen('home')}
                  className={`flex flex-col items-center gap-0.5 cursor-pointer ${emulatorScreen === 'home' ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}
                >
                  <span className="text-sm">🏠</span>
                  <span className="text-[9px] tracking-tight">Home</span>
                </button>
                <button 
                  onClick={() => setEmulatorScreen('scan')}
                  className={`flex flex-col items-center gap-0.5 cursor-pointer ${emulatorScreen === 'scan' ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}
                >
                  <span className="text-sm">📷</span>
                  <span className="text-[9px] tracking-tight">Scan</span>
                </button>
                <button 
                  onClick={() => setEmulatorScreen('market')}
                  className={`flex flex-col items-center gap-0.5 cursor-pointer ${emulatorScreen === 'market' ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}
                >
                  <span className="text-sm">📊</span>
                  <span className="text-[9px] tracking-tight">Market</span>
                </button>
                <button 
                  onClick={() => setEmulatorScreen('community')}
                  className={`flex flex-col items-center gap-0.5 cursor-pointer ${emulatorScreen === 'community' ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}
                >
                  <span className="text-sm">👥</span>
                  <span className="text-[9px] tracking-tight">Forum</span>
                </button>
              </div>

            </div>

            {/* Simulated Android Navigation gesture pill */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/25 rounded-full z-50 pointer-events-none" />
          </div>

          {/* Quick controls help panel */}
          <div className="mt-4 flex gap-3 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Live Android SDK 36
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Kotlin Compose
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
