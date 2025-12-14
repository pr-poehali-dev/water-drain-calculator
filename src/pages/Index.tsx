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
  materials: MaterialItem[];
  totalCost: number;
}

interface MaterialItem {
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

interface DrainPoint {
  id: string;
  x: number;
  y: number;
}

const Index = () => {
  const [roofArea, setRoofArea] = useState<string>('100');
  const [rainfall, setRainfall] = useState<string>('100');
  const [drainLength, setDrainLength] = useState<string>('10');
  const [material, setMaterial] = useState<string>('pvc');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [houseLength, setHouseLength] = useState<string>('12');
  const [houseWidth, setHouseWidth] = useState<string>('8');
  const [houseHeight, setHouseHeight] = useState<string>('6');
  const [drainPoints, setDrainPoints] = useState<DrainPoint[]>([]);

  const materials = {
    pvc: { name: 'ПВХ', roughness: 0.009, cost: 'Низкая', prices: { pipe: 450, gutter: 380, bracket: 85, funnel: 120, elbow: 95, connector: 65 } },
    metal: { name: 'Металл', roughness: 0.015, cost: 'Средняя', prices: { pipe: 850, gutter: 720, bracket: 145, funnel: 230, elbow: 180, connector: 110 } },
    copper: { name: 'Медь', roughness: 0.012, cost: 'Высокая', prices: { pipe: 2400, gutter: 2100, bracket: 340, funnel: 680, elbow: 520, connector: 290 } },
  };

  const handleHouseClick = (e: React.MouseEvent<SVGRectElement>) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newPoint: DrainPoint = {
      id: `drain-${Date.now()}`,
      x,
      y,
    };
    setDrainPoints([...drainPoints, newPoint]);
  };

  const removeDrainPoint = (id: string) => {
    setDrainPoints(drainPoints.filter(p => p.id !== id));
  };

  const calculateDrainage = () => {
    const area = parseFloat(roofArea);
    const intensity = parseFloat(rainfall);
    const length = parseFloat(drainLength);
    const height = parseFloat(houseHeight);

    const flowRate = (area * intensity) / 10000;
    
    let diameter = 50;
    if (flowRate > 1.5) diameter = 100;
    else if (flowRate > 0.8) diameter = 75;

    const minSlope = 0.002;
    const recommendedSlope = 0.005;
    const slope = length > 15 ? minSlope : recommendedSlope;

    const velocity = Math.sqrt((2 * 9.81 * diameter / 1000 * slope) / materials[material as keyof typeof materials].roughness);
    const capacity = (Math.PI * Math.pow(diameter / 2000, 2) * velocity * 3600).toFixed(2);

    const numDrains = Math.max(drainPoints.length, 2);
    const perimeter = (parseFloat(houseLength) + parseFloat(houseWidth)) * 2;
    
    const prices = materials[material as keyof typeof materials].prices;
    
    const materialsList: MaterialItem[] = [
      {
        name: 'Водосточная труба ⌀' + diameter + ' мм',
        quantity: Math.ceil(height * numDrains),
        unit: 'м',
        pricePerUnit: prices.pipe,
        totalPrice: Math.ceil(height * numDrains) * prices.pipe,
      },
      {
        name: 'Желоб водосточный',
        quantity: Math.ceil(perimeter),
        unit: 'м',
        pricePerUnit: prices.gutter,
        totalPrice: Math.ceil(perimeter) * prices.gutter,
      },
      {
        name: 'Кронштейн желоба',
        quantity: Math.ceil(perimeter / 0.6),
        unit: 'шт',
        pricePerUnit: prices.bracket,
        totalPrice: Math.ceil(perimeter / 0.6) * prices.bracket,
      },
      {
        name: 'Воронка водосточная',
        quantity: numDrains,
        unit: 'шт',
        pricePerUnit: prices.funnel,
        totalPrice: numDrains * prices.funnel,
      },
      {
        name: 'Колено трубы 45°',
        quantity: numDrains * 2,
        unit: 'шт',
        pricePerUnit: prices.elbow,
        totalPrice: numDrains * 2 * prices.elbow,
      },
      {
        name: 'Соединитель желоба',
        quantity: Math.ceil(perimeter / 3),
        unit: 'шт',
        pricePerUnit: prices.connector,
        totalPrice: Math.ceil(perimeter / 3) * prices.connector,
      },
    ];

    const totalCost = materialsList.reduce((sum, item) => sum + item.totalPrice, 0);

    setResult({
      diameter,
      slope: slope * 1000,
      material: materials[material as keyof typeof materials].name,
      capacity: parseFloat(capacity),
      velocity: parseFloat(velocity.toFixed(2)),
      materials: materialsList,
      totalCost,
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
              <div className="p-4 bg-secondary/20 rounded-lg border border-border/30">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Icon name="Home" size={16} className="text-primary" />
                  План дома (вид сверху)
                </h3>
                <div className="relative bg-background/50 rounded border border-border/50 overflow-hidden">
                  <svg className="w-full h-48" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <pattern id="houseGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(14, 165, 233, 0.05)" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    
                    <rect width="400" height="200" fill="url(#houseGrid)" />
                    
                    <rect 
                      x="100" y="50" width="200" height="100" 
                      fill="hsl(var(--card))" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth="2"
                      className="cursor-crosshair"
                      onClick={handleHouseClick}
                    />
                    
                    <line x1="100" y1="40" x2="100" y2="30" stroke="hsl(var(--muted-foreground))" strokeWidth="1"/>
                    <line x1="300" y1="40" x2="300" y2="30" stroke="hsl(var(--muted-foreground))" strokeWidth="1"/>
                    <line x1="100" y1="35" x2="300" y2="35" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" markerEnd="url(#arrow1)" markerStart="url(#arrow2)"/>
                    <text x="200" y="25" textAnchor="middle" fill="hsl(var(--primary))" fontSize="12" fontWeight="600">
                      {houseLength} м
                    </text>
                    
                    <line x1="310" y1="50" x2="320" y2="50" stroke="hsl(var(--muted-foreground))" strokeWidth="1"/>
                    <line x1="310" y1="150" x2="320" y2="150" stroke="hsl(var(--muted-foreground))" strokeWidth="1"/>
                    <line x1="315" y1="50" x2="315" y2="150" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" markerEnd="url(#arrow1)" markerStart="url(#arrow2)"/>
                    <text x="335" y="105" textAnchor="middle" fill="hsl(var(--primary))" fontSize="12" fontWeight="600">
                      {houseWidth} м
                    </text>
                    
                    {drainPoints.map((point) => (
                      <g key={point.id}>
                        <circle
                          cx={100 + (point.x / 100) * 200}
                          cy={50 + (point.y / 100) * 100}
                          r="6"
                          fill="hsl(var(--accent))"
                          stroke="hsl(var(--background))"
                          strokeWidth="2"
                          className="cursor-pointer hover:r-8 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDrainPoint(point.id);
                          }}
                        />
                        <text
                          x={100 + (point.x / 100) * 200}
                          y={50 + (point.y / 100) * 100 + 4}
                          textAnchor="middle"
                          fill="hsl(var(--background))"
                          fontSize="10"
                          fontWeight="bold"
                          pointerEvents="none"
                        >
                          ↓
                        </text>
                      </g>
                    ))}
                    
                    <defs>
                      <marker id="arrow1" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                        <polygon points="0 0, 8 4, 0 8" fill="hsl(var(--muted-foreground))" />
                      </marker>
                      <marker id="arrow2" markerWidth="8" markerHeight="8" refX="1" refY="4" orient="auto">
                        <polygon points="8 0, 0 4, 8 8" fill="hsl(var(--muted-foreground))" />
                      </marker>
                    </defs>
                  </svg>
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Icon name="MousePointerClick" size={12} />
                  Кликните по дому, чтобы добавить водосточные трубы
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="houseLength" className="text-xs">Длина (м)</Label>
                  <Input
                    id="houseLength"
                    type="number"
                    value={houseLength}
                    onChange={(e) => setHouseLength(e.target.value)}
                    className="bg-input/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="houseWidth" className="text-xs">Ширина (м)</Label>
                  <Input
                    id="houseWidth"
                    type="number"
                    value={houseWidth}
                    onChange={(e) => setHouseWidth(e.target.value)}
                    className="bg-input/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="houseHeight" className="text-xs">Высота (м)</Label>
                  <Input
                    id="houseHeight"
                    type="number"
                    value={houseHeight}
                    onChange={(e) => setHouseHeight(e.target.value)}
                    className="bg-input/50"
                  />
                </div>
              </div>

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
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="main">Основные</TabsTrigger>
                    <TabsTrigger value="materials">Материалы</TabsTrigger>
                    <TabsTrigger value="technical">Схема</TabsTrigger>
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

                    <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-foreground">Общая стоимость материалов</p>
                        <p className="text-2xl font-bold text-accent">{result.totalCost.toLocaleString('ru-RU')} ₽</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Установлено водосточных труб: {Math.max(drainPoints.length, 2)} шт
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="materials" className="space-y-4 mt-4">
                    <div className="p-4 bg-secondary/30 rounded-lg border border-border/30">
                      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Icon name="Package" size={16} className="text-primary" />
                        Спецификация материалов
                      </h3>
                      <div className="space-y-3">
                        {result.materials.map((item, index) => (
                          <div key={index} className="flex items-start justify-between p-3 bg-background/50 rounded border border-border/30">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{item.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.quantity} {item.unit} × {item.pricePerUnit} ₽
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-foreground">{item.totalPrice.toLocaleString('ru-RU')} ₽</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Итого к оплате</p>
                          <p className="text-xs text-muted-foreground mt-1">Включая все материалы</p>
                        </div>
                        <p className="text-3xl font-bold text-accent">{result.totalCost.toLocaleString('ru-RU')} ₽</p>
                      </div>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex gap-2 mb-2">
                        <Icon name="Info" size={16} className="text-primary mt-0.5" />
                        <p className="text-sm font-semibold text-foreground">Примечания</p>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                        <li>• Цены указаны за единицу товара</li>
                        <li>• Монтаж оплачивается отдельно</li>
                        <li>• Рекомендуем заказать материал с запасом 10%</li>
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="technical" className="space-y-4 mt-4">
                    <div className="p-4 bg-secondary/30 rounded-lg border border-border/30">
                      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Icon name="Network" size={16} className="text-primary" />
                        Схема водостока
                      </h3>
                      <div className="relative h-48 bg-background/50 rounded-lg border border-border/50 overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                          <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(14, 165, 233, 0.1)" strokeWidth="0.5"/>
                            </pattern>
                            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <animate attributeName="x1" values="0%;100%;0%" dur="3s" repeatCount="indefinite" />
                              <animate attributeName="x2" values="100%;200%;100%" dur="3s" repeatCount="indefinite" />
                              <stop offset="0%" stopColor="rgba(14, 165, 233, 0.3)" />
                              <stop offset="50%" stopColor="rgba(14, 165, 233, 0.6)" />
                              <stop offset="100%" stopColor="rgba(14, 165, 233, 0.3)" />
                            </linearGradient>
                          </defs>
                          
                          <rect width="400" height="200" fill="url(#grid)" />
                          
                          <line x1="50" y1="80" x2="350" y2={80 + parseFloat(drainLength) * result.slope / 5} 
                                stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                          <line x1="50" y1="95" x2="350" y2={95 + parseFloat(drainLength) * result.slope / 5} 
                                stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                          
                          <rect x="50" y={80} width="300" height="15" 
                                fill="url(#waterGradient)" opacity="0.7" 
                                transform={`skewY(${Math.atan(result.slope / 1000) * 180 / Math.PI})`} 
                                transform-origin="50 87.5" />
                          
                          <line x1="50" y1="70" x2="50" y2="105" 
                                stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeDasharray="3,3" />
                          <line x1="350" y1="70" x2="350" y2={110 + parseFloat(drainLength) * result.slope / 5} 
                                stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeDasharray="3,3" />
                          
                          <line x1="50" y1="120" x2="350" y2="120" 
                                stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="2,2" />
                          
                          <text x="200" y="140" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">
                            L = {drainLength} м
                          </text>
                          
                          <text x="370" y={100 + parseFloat(drainLength) * result.slope / 5} 
                                fill="hsl(var(--accent))" fontSize="12" fontWeight="bold">
                            h = {(parseFloat(drainLength) * result.slope).toFixed(0)} мм
                          </text>
                          
                          <text x="25" y="90" fill="hsl(var(--primary))" fontSize="11" fontWeight="600">
                            ⌀{result.diameter}
                          </text>
                          
                          <g transform="translate(50, 155)">
                            <line x1="0" y1="0" x2="30" y2="0" stroke="hsl(var(--accent))" strokeWidth="2" markerEnd="url(#arrowhead)" />
                            <text x="35" y="5" fill="hsl(var(--accent))" fontSize="11" fontWeight="600">
                              Направление потока
                            </text>
                          </g>
                          
                          <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                              <polygon points="0 0, 10 3, 0 6" fill="hsl(var(--accent))" />
                            </marker>
                          </defs>
                        </svg>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon name="Info" size={14} className="text-primary" />
                        <span>Анимированная схема показывает уклон {result.slope.toFixed(1)} мм/м</span>
                      </div>
                    </div>

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