import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { MapPin, Phone, Mail, Clock, Facebook } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#FBF2E1]" style={{ fontFamily: 'Times New Roman, serif' }}>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-[#930511] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-4 text-white text-4xl font-bold uppercase">Liên hệ với chúng tôi</h1>
          <p className="text-lg">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với GIỌT ẤM để được tư vấn!
          </p>
        </div>
      </section>

      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Contact Information */}
            <div className="space-y-6">
              <h2 className="text-[#930511] mb-8 text-3xl font-bold uppercase">Thông tin liên hệ</h2>

              {/* Address Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#930511] rounded-full flex items-center justify-center text-white shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[#930511] mb-2">Địa chỉ</h3>
                    <p>124 Hải Phòng, Thạch Thang, Hải Châu, Đà Nẵng</p>
                  </div>
                </div>
              </div>

              {/* Phone Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#930511] rounded-full flex items-center justify-center text-white shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[#930511] mb-2">Số điện thoại</h3>
                    <p>+84 987 123 418</p>
                    <p>+84 901 234 567</p>
                  </div>
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#930511] rounded-full flex items-center justify-center text-white shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[#930511] mb-2">Email</h3>
                    <p>hethonghienmaugiotam@gmail.com</p>
                  </div>
                </div>
              </div>

              {/* Working Hours Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#930511] rounded-full flex items-center justify-center text-white shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[#930511] mb-2">Giờ làm việc</h3>
                    <p>Thứ 2 - Thứ 6: 8:00 - 17:00</p>
                    <p>Thứ 7 - Chủ nhật: 8:00 - 12:00</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-[#930511] mb-4">Theo dõi chúng tôi</h3>
                <div className="flex items-center gap-4">
                  <a 
                    href="https://www.facebook.com/profile.php?id=61579486566866" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#930511] rounded-full flex items-center justify-center text-white hover:bg-[#7a0410] transition-colors"
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                  <span className="text-sm text-gray-700">Giọt Ấm - Hệ thống hiến máu thông minh</span>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div>
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-[#930511] mb-6 text-2xl font-bold uppercase">Gửi tin nhắn cho chúng tôi</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-[#930511]">
                      Họ và tên <span className="text-[#930511]">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Nhập họ và tên của bạn"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                      className="mt-2 bg-[#FBF2E1] border-[#FBF2E1] focus:border-[#930511]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-[#930511]">
                      Email <span className="text-[#930511]">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Nhập email của bạn"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                      className="mt-2 bg-[#FBF2E1] border-[#FBF2E1] focus:border-[#930511]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-[#930511]">
                      Số điện thoại
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Nhập số điện thoại của bạn"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="mt-2 bg-[#FBF2E1] border-[#FBF2E1] focus:border-[#930511]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-[#930511]">
                      Tin nhắn <span className="text-[#930511]">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Nhập nội dung tin nhắn"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      required
                      rows={6}
                      className="mt-2 bg-[#FBF2E1] border-[#FBF2E1] focus:border-[#930511] resize-none"
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-[#930511] text-white hover:bg-[#7a0410]"
                  >
                    Gửi tin nhắn
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-16">
            <h2 className="text-[#930511] text-center mb-8 text-3xl font-bold uppercase">Vị trí của chúng tôi</h2>
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="relative w-full h-[400px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.1234567890!2d108.2021667!3d16.0544068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c792252a13%3A0xf Bệnh+viẽn+Đà+Nẵng!5e0!3m2!1svi!2svn"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Vị trí Bệnh viện Đà Nẵng"
                ></iframe>
              </div>
              <div className="p-6 bg-[#FBF2E1]">
                <h3 className="mb-2">Bệnh viện Đà Nẵng</h3>
                <p className="text-gray-700 mb-4">
                  124 Hải Phòng, Thạch Thang,<br />
                  Hải Châu, Đà Nẵng
                </p>
                <a
                  href="https://www.google.com/maps/search/Bệnh+viện+Đà+Nẵng/@16.0544068,108.2021667,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#930511] hover:underline inline-flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Chỉ đường
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
