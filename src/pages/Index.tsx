
import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Eye, Package, Truck, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface OrderDetails {
  name: string;
  address: string;
  email: string;
  phone: string;
  deliveryMethod: string;
  items: CartItem[];
  total: number;
  discountCode?: string;
}

const Index = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const products: Product[] = [
    {
      id: '1',
      name: 'DEATH CARD',
      price: 5,
      description: 'Mystisk 3D printet kort med unik design',
    },
    {
      id: '2',
      name: 'Spiral',
      price: 25,
      description: 'Elegant spiral design perfekt til dekoration',
      imageUrl: 'https://raw.githubusercontent.com/Vortex3PS/Vortex3PS.github.io/refs/heads/main/Vortex%20Spiral.png'
    },
    {
      id: '3',
      name: 'Squishy',
      price: 25,
      description: 'Sjovt og funktionelt squishy legetøj',
      imageUrl: 'https://github.com/Vortex3PS/Vortex3PS.github.io/blob/main/squishy.png?raw=true'
    },
    {
      id: '4',
      name: 'Boomerang',
      price: 15,
      description: 'Aerodynamisk boomerang til udendørs aktiviteter',
    },
    {
      id: '5',
      name: 'Catapult',
      price: 25,
      description: 'Miniature katapult til leg og eksperimenter',
    }
  ];

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    toast({
      title: "Tilføjet til kurv",
      description: `${product.name} er blevet tilføjet til din kurv`,
    });
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + change);
          return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getDeliveryFee = () => {
    if (deliveryMethod === 'pickup') return 0;
    if (deliveryMethod === 'dao-pakkeshop') return 50;
    if (deliveryMethod === 'dao-door') return 55;
    return 0;
  };

  const applyDiscount = () => {
    const code = discountCode.toUpperCase().trim();
    const subtotal = getSubtotal();
    
    if (code === 'Q-WSW4WHWQWMW3W5WHW9') {
      setDiscountAmount(subtotal * 0.2);
      toast({
        title: "Rabatkode anvendt!",
        description: "20% rabat er blevet anvendt på din ordre",
      });
    } else if (code === 'VORTEXGO') {
      setDiscountAmount(subtotal * 0.1);
      toast({
        title: "Rabatkode anvendt!",
        description: "10% rabat er blevet anvendt på din ordre",
      });
    } else if (code === 'FREESHIP') {
      setDiscountAmount(getDeliveryFee());
      toast({
        title: "Rabatkode anvendt!",
        description: "Gratis levering er blevet anvendt",
      });
    } else if (code) {
      toast({
        title: "Ugyldig rabatkode",
        description: "Den indtastede rabatkode er ikke gyldig",
        variant: "destructive",
      });
    }
  };

  const getTotal = () => {
    return Math.max(0, getSubtotal() + getDeliveryFee() - discountAmount);
  };

  const sendOrderToDiscord = async (orderDetails: OrderDetails) => {
    const webhookUrl = "https://l.webhook.party/hook/SyavZOMy0XJHivLIySgZDPbPahmXghhQD2WzZNpNZBjrGVIX2Z0is7%2FZktHpoirvJ1b%2Bsy3trMw%2BT%2FX4HsUd0x6aKRPzQlLFkv%2FG2ppw5zVZkOh9RgXSeQTJW%2BdsJz6MHsIqUJ1FFZy55FpihwXfYotgtpchg0CGXbgb6MMF1IJ22KR7wvI69oMI%2F1IC3p3x4BvhmyLqtS%2Bi%2BvDuNA4dejtkrSNl1LNiDz3ZXYr%2FYD%2F7zQvIpvijoTaudprUPpsUll4pF%2BTmztN0ezL3XyUsRWoQNuF0IRFGRKdjlR1GszeHBcGnpgv%2Bea3%2B1eHjEfAJauSaaL%2BeyKUZDxKBKIjTCdwQci3yvx9jNVqEaLc%2FRBi0oF6ulHRSXWuGmirsxzltlOczWVtDbPM%3D/VtWLh1wllBBooHIT";
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          embeds: [{
            title: "🛒 Ny 3D Webshop Ordre",
            color: 0x00ff00,
            fields: [
              { name: "👤 Kunde", value: orderDetails.name, inline: true },
              { name: "📧 Email", value: orderDetails.email, inline: true },
              { name: "📞 Telefon", value: orderDetails.phone, inline: true },
              { name: "📍 Adresse", value: orderDetails.address, inline: false },
              { name: "🚚 Leveringsmetode", value: orderDetails.deliveryMethod, inline: true },
              { name: "💰 Total", value: `${orderDetails.total.toFixed(2)} DKK`, inline: true },
              { name: "🎫 Rabatkode", value: orderDetails.discountCode || 'Ingen', inline: true },
              { 
                name: "📦 Produkter", 
                value: orderDetails.items.map(item => 
                  `• ${item.name} x${item.quantity} - ${(item.price * item.quantity)} DKK`
                ).join('\n'), 
                inline: false 
              }
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "3D Vortex Webshop" }
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send order');
      }
      
      return true;
    } catch (error) {
      console.error('Error sending order to Discord:', error);
      return false;
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const orderDetails: OrderDetails = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      deliveryMethod: deliveryMethod,
      items: cart,
      total: getTotal(),
      discountCode: discountCode || undefined
    };

    const success = await sendOrderToDiscord(orderDetails);
    
    if (success) {
      toast({
        title: "Ordre bekræftet!",
        description: `Tak for dit køb, ${orderDetails.name}! Vi behandler din ordre hurtigst muligt.`,
      });
      
      // Reset form and cart
      setCart([]);
      setShowCheckout(false);
      setDiscountCode('');
      setDiscountAmount(0);
    } else {
      toast({
        title: "Fejl ved ordrebehandling",
        description: "Der opstod en fejl. Prøv venligst igen eller kontakt os direkte.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const openImage = (url: string) => {
    window.open(url, '_blank');
  };

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Package className="h-6 w-6" />
                Checkout
              </CardTitle>
              <CardDescription className="text-blue-100">
                Udfyld dine oplysninger for at gennemføre købet
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* Order Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">Din ordre:</h3>
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center mb-2">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-medium">{item.price * item.quantity} DKK</span>
                  </div>
                ))}
                <Separator className="my-3" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{getSubtotal()} DKK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Levering:</span>
                    <span>{getDeliveryFee()} DKK</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Rabat:</span>
                      <span>-{discountAmount} DKK</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{getTotal()} DKK</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCheckout} className="space-y-4">
                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Navn *</Label>
                    <Input id="name" name="name" required placeholder="Dit fulde navn" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" required placeholder="din@email.dk" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Adresse *</Label>
                  <Input id="address" name="address" required placeholder="Din fulde adresse" />
                </div>

                <div>
                  <Label htmlFor="phone">Telefonnummer *</Label>
                  <Input id="phone" name="phone" type="tel" required placeholder="+45 12 34 56 78" />
                </div>

                {/* Delivery Method */}
                <div>
                  <Label>Leveringsmetode</Label>
                  <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pickup">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Pickup (Gratis)
                        </div>
                      </SelectItem>
                      <SelectItem value="dao-pakkeshop">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          DAO Pakkeshop (50 DKK)
                        </div>
                      </SelectItem>
                      <SelectItem value="dao-door">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          DAO Til Dør (55 DKK)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Discount Code */}
                <div>
                  <Label htmlFor="discount">Rabatkode</Label>
                  <div className="flex gap-2">
                    <Input
                      id="discount"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Indtast rabatkode"
                    />
                    <Button type="button" variant="outline" onClick={applyDiscount}>
                      Anvend
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCheckout(false)}
                    className="flex-1"
                  >
                    Tilbage til shop
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isLoading ? 'Behandler...' : `Bekræft køb (${getTotal()} DKK)`}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                3D Vortex Webshop
              </h1>
              <p className="text-gray-600 mt-2">Unikke 3D printede produkter af højeste kvalitet</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Premium 3D Print
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-gray-800">{product.name}</CardTitle>
                      <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        {product.price} DKK
                      </Badge>
                    </div>
                    {product.description && (
                      <CardDescription className="text-gray-600">
                        {product.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => addToCart(product)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Læg i kurv
                      </Button>
                      {product.imageUrl && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openImage(product.imageUrl!)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Din Kurv ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Din kurv er tom</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-gray-600 text-sm">{item.price} DKK</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total:</span>
                      <span>{getSubtotal()} DKK</span>
                    </div>
                    
                    <Button 
                      onClick={() => setShowCheckout(true)}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      disabled={cart.length === 0}
                    >
                      Gå til Checkout
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
