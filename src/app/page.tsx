
"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert, Settings, FileText, Loader2, Sparkles, ListPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { BlockingOverlay } from '@/components/blocking-overlay';
import { checkContent } from './actions';
import type { ContentAnalysis } from '@/ai/flows/content-check';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const PERMISSIONS_CONFIG = {
  accessibility: {
    key: 'screenGuardianAccessibilityEnabled',
    title: 'Accessibility Service',
    description: 'Allows Screen Guardian to monitor on-screen text for harmful content.',
    icon: <FileText className="h-6 w-6" />,
  },
  overlay: {
    key: 'screenGuardianOverlayEnabled',
    title: 'Overlay Permission',
    description: 'Enables the app to display a warning overlay when blocked content is detected.',
    icon: <ShieldAlert className="h-6 w-6" />,
  },
};

export default function ScreenGuardianPage() {
  const [permissions, setPermissions] = useState({
    accessibility: false,
    overlay: false,
  });
  const [text, setText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<ContentAnalysis | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [blockedWords, setBlockedWords] = useState<Set<string>>(new Set());
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Pro features state
  const [isPro, setIsPro] = useState(false);
  const [customBlockedWords, setCustomBlockedWords] = useState<string[]>([]);
  const [newCustomWord, setNewCustomWord] = useState('');

  useEffect(() => {
    // Load permissions
    setPermissions({
      accessibility: localStorage.getItem(PERMISSIONS_CONFIG.accessibility.key) === 'true',
      overlay: localStorage.getItem(PERMISSIONS_CONFIG.overlay.key) === 'true',
    });

    // Load Pro status
    setIsPro(localStorage.getItem('screenGuardianPro') === 'true');

    // Load custom blocklist
    const storedCustomWords = localStorage.getItem('customBlockedWords');
    if (storedCustomWords) {
      try {
        setCustomBlockedWords(JSON.parse(storedCustomWords));
      } catch (e) {
        console.error("Failed to parse custom blocked words", e);
      }
    }

    const loadBlocklist = async () => {
      const cachedWordsJSON = localStorage.getItem('blockedWords');
      if (cachedWordsJSON) {
        try {
          const cachedWords = JSON.parse(cachedWordsJSON);
          setBlockedWords(new Set(cachedWords));
        } catch (e) {
          console.error("Failed to parse cached blocklist", e);
        }
      }

      try {
        const response = await fetch('/blocked-words.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const remoteWords = data.words || [];
        setBlockedWords(new Set(remoteWords));
        localStorage.setItem('blockedWords', JSON.stringify(remoteWords));
      } catch (err) {
        console.error("Failed to fetch or update blocklist:", err);
        if (!cachedWordsJSON) {
            toast({
                variant: 'destructive',
                title: 'Failed to load blocklist',
                description: 'Could not fetch remote blocklist. Please check your connection.',
            });
        }
      }
    };
    
    loadBlocklist();
  }, [toast]);

  const handlePermissionToggle = (permission: 'accessibility' | 'overlay') => {
    const newStatus = !permissions[permission];
    localStorage.setItem(PERMISSIONS_CONFIG[permission].key, String(newStatus));
    setPermissions(prev => ({ ...prev, [permission]: newStatus }));
    toast({
      title: `${PERMISSIONS_CONFIG[permission].title} ${newStatus ? 'Enabled' : 'Disabled'}`,
      description: `The permission has been successfully ${newStatus ? 'granted' : 'revoked'}.`,
    });
  };

  const handleClear = () => {
    setText('');
    setAnalysisResult(null);
    setIsChecking(false);
    if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
    }
  };

  const combinedBlockedWords = useMemo(() => {
    return new Set([...Array.from(blockedWords), ...customBlockedWords]);
  }, [blockedWords, customBlockedWords]);


  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setAnalysisResult(null);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    setIsChecking(true);

    debounceTimeout.current = setTimeout(async () => {
      if (newText.trim() === '') {
        setAnalysisResult(null);
        setIsChecking(false);
        return;
      }

      const textToCheck = newText.toLowerCase();
      const hasPotentialMatch = Array.from(combinedBlockedWords).some(word => 
        textToCheck.includes(word.toLowerCase())
      );
      
      if (hasPotentialMatch) {
        const result = await checkContent(newText);
        setAnalysisResult(result);
        if (result?.isObjectionable) {
            try {
                const storedHistoryJSON = localStorage.getItem('blockingHistory');
                const history = storedHistoryJSON ? JSON.parse(storedHistoryJSON) : [];
                const newEntry = { ...result, timestamp: new Date().toISOString() };
                localStorage.setItem('blockingHistory', JSON.stringify([...history, newEntry]));
            } catch (e) {
                console.error("Failed to update blocking history", e);
            }
        }
      } else {
        setAnalysisResult(null);
      }
      setIsChecking(false);
    }, 500);
  };

  const handleProToggle = () => {
    const newProStatus = !isPro;
    setIsPro(newProStatus);
    localStorage.setItem('screenGuardianPro', String(newProStatus));
    toast({
      title: `Pro Features ${newProStatus ? 'Activated' : 'Deactivated'}`,
      description: `You now have ${newProStatus ? 'access to' : 'lost access to'} all Pro features.`,
    });
  };

  const handleAddCustomWord = () => {
      if (newCustomWord.trim() && !customBlockedWords.includes(newCustomWord.trim().toLowerCase())) {
          const updatedWords = [...customBlockedWords, newCustomWord.trim().toLowerCase()];
          setCustomBlockedWords(updatedWords);
          localStorage.setItem('customBlockedWords', JSON.stringify(updatedWords));
          setNewCustomWord('');
      }
  };

  const handleRemoveCustomWord = (wordToRemove: string) => {
      const updatedWords = customBlockedWords.filter(word => word !== wordToRemove);
      setCustomBlockedWords(updatedWords);
      localStorage.setItem('customBlockedWords', JSON.stringify(updatedWords));
  };


  const allPermissionsGranted = useMemo(() => Object.values(permissions).every(p => p), [permissions]);
  const isBlocking = useMemo(() => analysisResult?.isObjectionable === true, [analysisResult]);

  const renderPermissionsSetup = () => (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Setup Required
        </CardTitle>
        <CardDescription>
          To protect your device, please enable the following services. Screen Guardian respects your privacy and only uses these permissions to detect and block harmful content.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(PERMISSIONS_CONFIG).map(([key, config]) => (
          <div key={key} className="flex items-start space-x-4">
            <div className="flex-shrink-0 text-primary">{config.icon}</div>
            <div className="flex-1">
              <h3 className="font-semibold">{config.title}</h3>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
            <Button
              onClick={() => handlePermissionToggle(key as 'accessibility' | 'overlay')}
              variant={permissions[key as 'accessibility' | 'overlay'] ? 'secondary' : 'default'}
              className="w-28"
            >
              {permissions[key as 'accessibility' | 'overlay'] ? 'Disable' : 'Enable'}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderMonitoringInterface = () => (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Monitoring Active
        </CardTitle>
        <CardDescription>
          Paste or type text below. Screen Guardian will analyze it in real-time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Textarea
            placeholder="Your safe space to check text..."
            className="min-h-[200px] text-base"
            value={text}
            onChange={handleTextChange}
            disabled={isBlocking}
          />
           {isChecking && <Loader2 className="absolute top-3 right-3 h-5 w-5 animate-spin text-muted-foreground" />}
        </div>
      </CardContent>
      <CardFooter>
          <p className="text-xs text-muted-foreground">This is a web simulation. In the native app, this monitoring happens automatically across your device.</p>
      </CardFooter>
      <BlockingOverlay result={analysisResult} onClear={handleClear} />
    </Card>
  );

  const renderCustomBlocklist = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListPlus className="h-6 w-6" />
          Custom Blocklist
          {!isPro && <Badge variant="secondary">Pro</Badge>}
        </CardTitle>
        <CardDescription>
          Add your own words or phrases to block. This is a Pro feature.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn(!isPro && "relative")}>
        {!isPro && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
                <div className="text-center">
                    <p className="font-semibold">This is a Pro feature.</p>
                    <p className="text-sm text-muted-foreground">Enable the Pro subscription to use it.</p>
                </div>
            </div>
        )}
        <div className={cn("space-y-4", !isPro && "blur-sm")}>
            <div className="flex gap-2">
                <Input
                    value={newCustomWord}
                    onChange={(e) => setNewCustomWord(e.target.value)}
                    placeholder="Add a word..."
                    disabled={!isPro}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddCustomWord();
                    }}
                />
                <Button onClick={handleAddCustomWord} disabled={!isPro}>Add Word</Button>
            </div>
            {customBlockedWords.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">Your custom words:</p>
                    <div className="flex flex-wrap gap-2">
                        {customBlockedWords.map(word => (
                            <Badge key={word} variant="secondary" className="pl-3 pr-1 text-sm">
                                {word}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-1 h-5 w-5 rounded-full"
                                    onClick={() => handleRemoveCustomWord(word)}
                                    disabled={!isPro}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );

  const renderSubscriptionManager = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" />
          Manage Subscription
        </CardTitle>
        <CardDescription>
          Unlock Pro features like the custom blocklist for enhanced protection.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <h3 className="font-semibold">Screen Guardian Pro</h3>
            <p className="text-sm text-muted-foreground">
              {isPro ? "Your subscription is active." : "Unlock custom blocklists and more."}
            </p>
          </div>
          <Switch
            checked={isPro}
            onCheckedChange={handleProToggle}
            aria-label="Toggle Pro Subscription"
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 md:p-8 font-body">
        <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-primary tracking-tight">Screen Guardian</h1>
                <p className="text-lg text-muted-foreground mt-2">Your shield in the digital world.</p>
            </div>

            {allPermissionsGranted ? (
              <div className="space-y-8">
                {renderMonitoringInterface()}
                {renderCustomBlocklist()}
                {renderSubscriptionManager()}
              </div>
            ) : renderPermissionsSetup()}
            
            <div className="space-y-8 mt-8">
              <div className="flex items-center justify-center gap-4">
                  {allPermissionsGranted && (
                    <Button asChild variant="secondary">
                        <Link href="/dashboard">
                        View Activity Dashboard
                        </Link>
                    </Button>
                  )}
                  <Button variant="link" size="sm" className="text-muted-foreground" onClick={() => {
                      setPermissions({accessibility: false, overlay: false});
                      localStorage.removeItem(PERMISSIONS_CONFIG.accessibility.key);
                      localStorage.removeItem(PERMISSIONS_CONFIG.overlay.key);
                  }}>
                    Reset Permissions
                  </Button>
              </div>
            </div>
       </div>
    </main>
  );
}

    