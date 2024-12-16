"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface ChartData {
  month: number;
  total: number;
  principal: number;
  interest: number;
  contributions: number;
}

interface DetailedResults {
  totalInvested: number;
  totalInterest: number;
  totalContributions: number;
  finalBalance: number;
  percentageGain: number;
}

const CompoundCalculator = () => {
  const [principal, setPrincipal] = useState<string>('1000');
  const [rate, setRate] = useState<string>('5');
  const [time, setTime] = useState<string>('5');
  const [monthlyContribution, setMonthlyContribution] = useState<string>('100');
  const [results, setResults] = useState<DetailedResults | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [contributionFrequency, setContributionFrequency] = useState<'monthly' | 'yearly'>('monthly');
  const [adjustForInflation, setAdjustForInflation] = useState(false);
  const [inflationRate, setInflationRate] = useState<string>('3');
  const { toast } = useToast();

  const calculateCompoundInterest = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);
    const m = parseFloat(monthlyContribution);
    const inf = adjustForInflation ? parseFloat(inflationRate) / 100 : 0;

    if ([p, r, t, m].some(isNaN)) {
      toast({
        title: "Erro",
        description: "Por favor, insira valores numéricos válidos.",
        variant: "destructive",
      });
      return;
    }

    const monthlyRate = r / 12;
    const totalMonths = t * 12;
    const contributionInterval = contributionFrequency === 'monthly' ? 1 : 12;
    const contributionAmount = contributionFrequency === 'monthly' ? m : m * 12;
    
    const data: ChartData[] = [];
    let balance = p;
    let totalContributions = p;
    let totalInterest = 0;
    // let realBalance = p;

    for (let month = 0; month <= totalMonths; month++) {
      const monthlyInflation = inf / 12;
      const realValue = balance / Math.pow(1 + monthlyInflation, month);
      
      data.push({
        month,
        total: adjustForInflation ? realValue : balance,
        principal: p,
        interest: adjustForInflation ? (realValue - totalContributions) : totalInterest,
        contributions: totalContributions
      });

      if (month < totalMonths) {
        const monthlyInterest = balance * monthlyRate;
        totalInterest += monthlyInterest;
        
        if (month % contributionInterval === 0) {
          balance += contributionAmount;
          totalContributions += contributionAmount;
        }
        
        balance += monthlyInterest;
      }
    }

    const finalBalance = adjustForInflation ? 
      balance / Math.pow(1 + inf, t) : 
      balance;

    setResults({
      totalInvested: totalContributions,
      totalInterest: finalBalance - totalContributions,
      totalContributions: totalContributions - p,
      finalBalance,
      percentageGain: ((finalBalance - totalContributions) / totalContributions) * 100
    });
    
    setChartData(data);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Calculadora de Juros Compostos Avançada</CardTitle>
          <CardDescription>
            Simule seus investimentos com análise detalhada e ajustes de inflação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="input" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">Dados de Entrada</TabsTrigger>
              <TabsTrigger value="advanced">Configurações Avançadas</TabsTrigger>
            </TabsList>

            <TabsContent value="input">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="principal">Investimento Inicial (R$)</Label>
                  <Input
                    id="principal"
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Taxa de Juros Anual (%)</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Período (Anos)</Label>
                  <Input
                    id="time"
                    type="number"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly">Valor do Aporte (R$)</Label>
                  <Input
                    id="monthly"
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced">
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="frequency">Frequência dos Aportes</Label>
                  <Select
                    value={contributionFrequency}
                    onValueChange={(value: 'monthly' | 'yearly') => setContributionFrequency(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="inflation">Ajustar para Inflação</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostra valores ajustados pelo poder de compra
                    </p>
                  </div>
                  <Switch
                    checked={adjustForInflation}
                    onCheckedChange={setAdjustForInflation}
                  />
                </div>

                {adjustForInflation && (
                  <div className="space-y-2">
                    <Label htmlFor="inflationRate">Taxa de Inflação Anual (%)</Label>
                    <Input
                      id="inflationRate"
                      type="number"
                      value={inflationRate}
                      onChange={(e) => setInflationRate(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={calculateCompoundInterest} className="w-full mt-6">
            Calcular
          </Button>

          {results && (
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <p className="text-sm font-medium">Montante Final</p>
                  <p className="text-2xl font-bold">
                    {results.finalBalance.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm font-medium">Total Investido</p>
                  <p className="text-2xl font-bold">
                    {results.totalInvested.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm font-medium">Juros Ganhos</p>
                  <p className="text-2xl font-bold">
                    {results.totalInterest.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm font-medium">Retorno (%)</p>
                  <p className="text-2xl font-bold">
                    {results.percentageGain.toFixed(2)}%
                  </p>
                </Card>
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      label={{ value: 'Meses', position: 'bottom' }} 
                    />
                    <YAxis 
                      label={{ 
                        value: adjustForInflation ? 'Valor Real (R$)' : 'Valor (R$)', 
                        angle: -90, 
                        position: 'insideLeft' 
                      }}
                      tickFormatter={(value) => 
                        value.toLocaleString('pt-BR', {
                          notation: 'compact',
                          currency: 'BRL'
                        })
                      }
                    />
                    <Tooltip 
                      formatter={(value: number) => 
                        value.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })
                      }
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="contributions"
                      fill="#4ade80"
                      stroke="#4ade80"
                      name="Aportes"
                    />
                    <Area
                      type="monotone"
                      dataKey="interest"
                      fill="#60a5fa"
                      stroke="#60a5fa"
                      name="Juros"
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#2563eb"
                      strokeWidth={2}
                      name="Total"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompoundCalculator;
