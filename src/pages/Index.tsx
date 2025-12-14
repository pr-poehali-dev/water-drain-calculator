import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface CalculationResult {
  diameter: number;
  slope: number;
  material: string;
  capacity: number;
  velocity: number;
}

const Index = () => {
  const [roofArea, setRoofArea] = useState<string>('100');
  const [rainfall, setRainfall] = useState<string>('100');
  const [drainLength, setDrainLength] = useState<string>('10');
  const [material, setMaterial] = useState<string>('pvc');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const materials = {
    pvc: { name: 'ПВХ', roughness: 0.009, cost: 'Низкая' },
    metal: { name: 'Металл', roughness: 0.015, cost: 'Средняя' },
    copper: { name: 'Медь', roughness: 0.012, cost: 'Высокая' },
  };

  const calculateDrainage = () => {
    const area = parseFloat(roofArea);
    const intensity = parseFloat(rainfall);
    const length = parseFloat(drainLength);

    const flowRate = (area * intensity) / 10000;
    
    let diameter = 50;
    if (flowRate > 1.5) diameter = 100;
    else if (flowRate > 0.8) diameter = 75;

    const minSlope = 0.002;
    const recommendedSlope = 0.005;
    const slope = length > 15 ? minSlope : recommendedSlope;

    const velocity = Math.sqrt((2 * 9.81 * diameter / 1000 * slope) / materials[material as keyof typeof materials].roughness);
    const capacity = (Math.PI * Math.pow(diameter / 2000, 2) * velocity * 3600).toFixed(2);

    setResult({
      diameter,
      slope: slope * 1000,
      material: materials[material as keyof typeof materials].name,
      capacity: parseFloat(capacity),
      velocity: parseFloat(velocity.toFixed(2)),
    });
  };

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Icon name="Droplets" size={32} className="text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Калькулятор водостоков</h1>
          </div>
          <p className="text-muted-foreground text-lg">Инженерный расчет системы водоотведения</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon name="Calculator" className="text-primary" size={24} />
                <CardTitle>Исходные данные</CardTitle>
              </div>
              <CardDescription>Введите параметры кровли и условия эксплуатации</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="roofArea" className="flex items-center gap-2">
                  <Icon name="Home" size={16} className="text-primary" />
                  Площадь кровли (м²)
                </Label>
                <Input
                  id="roofArea"
                  type="number"
                  value={roofArea}
                  onChange={(e) => setRoofArea(e.target.value)}
                  className="bg-input/50"
                  placeholder="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rainfall" className="flex items-center gap-2">
                  <Icon name="CloudRain" size={16} className="text-primary" />
                  Интенсивность осадков (мм/ч)
                </Label>
                <Input
                  id="rainfall"
                  type="number"
                  value={rainfall}
                  onChange={(e) => setRainfall(e.target.value)}
                  className="bg-input/50"
                  placeholder="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="drainLength" className="flex items-center gap-2">
                  <Icon name="Ruler" size={16} className="text-primary" />
                  Длина водостока (м)
                </Label>
                <Input
                  id="drainLength"
                  type="number"
                  value={drainLength}
                  onChange={(e) => setDrainLength(e.target.value)}
                  className="bg-input/50"
                  placeholder="10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material" className="flex items-center gap-2">
                  <Icon name="Package" size={16} className="text-primary" />
                  Материал водостока
                </Label>
                <Select value={material} onValueChange={setMaterial}>
                  <SelectTrigger className="bg-input/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pvc">ПВХ (пластик)</SelectItem>
                    <SelectItem value="metal">Оцинкованная сталь</SelectItem>
                    <SelectItem value="copper">Медь</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={calculateDrainage} className="w-full gap-2" size="lg">
                <Icon name="Play" size={18} />
                Рассчитать систему
              </Button>
            </CardContent>
          </Card>

          {result && (
            <Card className="border-primary/30 bg-card/50 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon name="ClipboardCheck" className="text-accent" size={24} />
                  <CardTitle>Результаты расчета</CardTitle>
                </div>
                <CardDescription>Технические параметры системы водоотведения</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="main" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="main">Основные</TabsTrigger>
                    <TabsTrigger value="technical">Технические</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="main" className="space-y-4 mt-4">
                    <div className="flex items-start justify-between p-4 bg-secondary/30 rounded-lg border border-border/30">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                          <Icon name="Diameter" size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Диаметр водостока</p>
                          <p className="text-2xl font-bold text-foreground">{result.diameter} мм</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start justify-between p-4 bg-secondary/30 rounded-lg border border-border/30">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                          <Icon name="TrendingDown" size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Уклон водостока</p>
                          <p className="text-2xl font-bold text-foreground">{result.slope.toFixed(1)} мм/м</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start justify-between p-4 bg-secondary/30 rounded-lg border border-border/30">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded">
                          <Icon name="Box" size={20} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Материал</p>
                          <p className="text-2xl font-bold text-foreground">{result.material}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Стоимость: {materials[material as keyof typeof materials].cost}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="technical" className="space-y-4 mt-4">
                    <div className="p-4 bg-secondary/30 rounded-lg border border-border/30 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Пропускная способность</span>
                        <span className="font-mono font-semibold text-foreground">{result.capacity} м³/ч</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Скорость потока</span>
                        <span className="font-mono font-semibold text-foreground">{result.velocity} м/с</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Коэффициент шероховатости</span>
                        <span className="font-mono font-semibold text-foreground">
                          {materials[material as keyof typeof materials].roughness}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex gap-2 mb-2">
                        <Icon name="Info" size={16} className="text-primary mt-0.5" />
                        <p className="text-sm font-semibold text-foreground">Рекомендации</p>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                        <li>• Минимальная скорость потока: 0.7 м/с</li>
                        <li>• Максимальная скорость потока: 4.0 м/с</li>
                        <li>• Рекомендуемое наполнение: 60-80%</li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {!result && (
            <Card className="border-border/30 bg-card/30 backdrop-blur-sm flex items-center justify-center">
              <CardContent className="text-center py-16">
                <Icon name="Calculator" size={64} className="text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Введите данные и нажмите "Рассчитать систему"</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Card className="border-border/30 bg-card/30 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded">
                  <Icon name="Zap" size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Быстрый расчет</h3>
                  <p className="text-sm text-muted-foreground">
                    Мгновенные результаты на основе актуальных норм СНиП
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-card/30 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded">
                  <Icon name="Shield" size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Точность расчетов</h3>
                  <p className="text-sm text-muted-foreground">
                    Учет всех параметров и характеристик материалов
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-card/30 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-accent/10 rounded">
                  <Icon name="Settings" size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Гибкие настройки</h3>
                  <p className="text-sm text-muted-foreground">
                    Выбор материалов и параметров под ваш проект
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
