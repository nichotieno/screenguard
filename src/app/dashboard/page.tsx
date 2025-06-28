
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { BarChart as BarChartIcon, Home, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, XAxis, YAxis, CartesianGrid, BarChart as RechartsBarChart } from "recharts"
import { format, parseISO } from 'date-fns';
import type { ContentAnalysis } from '@/ai/flows/content-check';

type HistoryEntry = ContentAnalysis & { timestamp: string };

export default function DashboardPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedHistory = localStorage.getItem('blockingHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse blocking history", e);
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('blockingHistory');
    setHistory([]);
  };

  const chartData = useMemo(() => {
    const categoryCounts: { [key: string]: number } = {};
    history.forEach(entry => {
      if (entry.isObjectionable) {
        // Exclude "Other" and "Safe" from the chart for clarity
        if (entry.category !== 'Other' && entry.category !== 'Safe') {
            categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1;
        }
      }
    });
    return Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));
  }, [history]);

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [history]);


  if (!isClient) {
    // Render nothing on the server to avoid hydration mismatch
    return null; 
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <h1 className="text-4xl font-bold text-primary tracking-tight">Activity Dashboard</h1>
            <p className="text-lg text-muted-foreground mt-2">An overview of content monitoring activity.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {history.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Activity Yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">The dashboard will populate with data once harmful content is detected and blocked.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {chartData.length > 0 && (
                 <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <BarChartIcon className="h-6 w-6" />
                     Blocked Content by Category
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <ChartContainer config={{ count: { label: "Count", color: "hsl(var(--primary))" } }} className="h-[250px] w-full">
                     <RechartsBarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} />
                       <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12}/>
                       <YAxis allowDecimals={false} />
                       <ChartTooltip
                         cursor={false}
                         content={<ChartTooltipContent indicator="dot" />}
                       />
                       <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                     </RechartsBarChart>
                   </ChartContainer>
                 </CardContent>
               </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Recent Blocks</CardTitle>
                <CardDescription>A log of the most recently blocked content.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedHistory.slice(0, 10).map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {format(parseISO(entry.timestamp), "MMM d, yyyy 'at' h:mm a")}
                        </TableCell>
                        <TableCell>{entry.category}</TableCell>
                        <TableCell>{entry.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="destructive" onClick={clearHistory}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear History
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
