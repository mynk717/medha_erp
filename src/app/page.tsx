'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { 
  Package, 
  ShoppingCart, 
  FileText, 
  TrendingUp, 
  Shield, 
  Zap, 
  Database,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Users,
  Bell,
  Settings,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to ERP
    if (status === 'authenticated') {
      router.push('/erp');
    }
  }, [status, router]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Hero Section */}
      <header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px 40px'
      }}>
        <nav style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Image 
              src="/medha-logo.png" 
              alt="Medha Logo" 
              width={50} 
              height={50} 
              style={{ borderRadius: '8px' }} 
            />
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>Medha ERP</h1>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a href="#features" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              fontWeight: '500',
              padding: '8px 16px',
              borderRadius: '6px',
              transition: 'background 0.2s'
            }}>
              Features
            </a>
            <a href="#pricing" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              fontWeight: '500',
              padding: '8px 16px',
              borderRadius: '6px',
              transition: 'background 0.2s'
            }}>
              Pricing
            </a>
            <button
              onClick={() => signIn('google', { callbackUrl: '/erp' })}
              style={{
                background: 'white',
                color: '#667eea',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Content */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '80px 40px 120px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '56px', 
            fontWeight: '800', 
            marginBottom: '24px',
            lineHeight: '1.2'
          }}>
            Smart Business Management<br />for Modern Enterprises
          </h2>
          <p style={{ 
            fontSize: '20px', 
            marginBottom: '40px', 
            opacity: 0.95,
            lineHeight: '1.6'
          }}>
            Manage inventory, sales, purchases, invoices, and bills seamlessly with Google Sheets integration. 
            Your data, your control, unlimited possibilities.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => signIn('google', { callbackUrl: '/erp' })}
              style={{
                background: 'white',
                color: '#667eea',
                padding: '16px 40px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '18px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
              }}
            >
              <Zap className="w-5 h-5" />
              Start Free Trial
            </button>
            
            <a 
              href="#features"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '16px 40px',
                borderRadius: '12px',
                border: '2px solid rgba(255,255,255,0.3)',
                fontWeight: '700',
                fontSize: '18px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.3s'
              }}
            >
              Learn More
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ 
        padding: '80px 40px', 
        background: 'white',
        marginTop: '-60px',
        borderRadius: '24px 24px 0 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h3 style={{ 
              fontSize: '42px', 
              fontWeight: '800', 
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              Everything You Need to Run Your Business
            </h3>
            <p style={{ fontSize: '18px', color: '#64748b' }}>
              Powerful features designed for small to medium businesses
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '32px' 
          }}>
            {[
              {
                icon: Package,
                title: 'Inventory Management',
                description: 'Track stock levels, manage SKUs, and monitor low stock alerts in real-time',
                color: '#3b82f6'
              },
              {
                icon: ShoppingCart,
                title: 'Sales & Purchases',
                description: 'Record sales and purchases with automatic GST calculation and reporting',
                color: '#10b981'
              },
              {
                icon: FileText,
                title: 'Invoicing & Bills',
                description: 'Generate professional invoices, track payments, and manage bills effortlessly',
                color: '#8b5cf6'
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                description: 'Get insights with real-time reports on sales, revenue, and business performance',
                color: '#f59e0b'
              },
              {
                icon: Bell,
                title: 'Smart Reminders',
                description: 'Never miss a payment deadline with automated WhatsApp reminders',
                color: '#ef4444'
              },
              {
                icon: Database,
                title: 'Google Sheets Sync',
                description: 'Your data stays in YOUR Google Sheet - full control and ownership',
                color: '#06b6d4'
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} style={{
                  background: '#f8fafc',
                  padding: '32px',
                  borderRadius: '16px',
                  border: '2px solid #e2e8f0',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
                  e.currentTarget.style.borderColor = feature.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    background: `${feature.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <Icon style={{ width: '32px', height: '32px', color: feature.color }} />
                  </div>
                  <h4 style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: '#1e293b',
                    marginBottom: '12px'
                  }}>
                    {feature.title}
                  </h4>
                  <p style={{ color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section style={{ padding: '80px 40px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h3 style={{ 
              fontSize: '42px', 
              fontWeight: '800', 
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              Why Choose Medha ERP?
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
            <div>
              {[
                'No vendor lock-in - Your data stays in Google Sheets',
                'Free forever - No hidden costs or subscriptions',
                'Instant setup - Start in under 2 minutes',
                'Secure OAuth authentication',
                'WhatsApp integration for instant notifications',
                'Multi-device access from anywhere'
              ].map((point, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <CheckCircle style={{ width: '24px', height: '24px', color: '#10b981', flexShrink: 0 }} />
                  <span style={{ fontSize: '18px', color: '#475569' }}>{point}</span>
                </div>
              ))}
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '40px',
              borderRadius: '20px',
              color: 'white'
            }}>
              <Shield className="w-16 h-16" style={{ marginBottom: '24px' }} />
              <h4 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
                Enterprise-Grade Security
              </h4>
              <p style={{ fontSize: '16px', lineHeight: '1.6', opacity: 0.95 }}>
                Built with industry-standard security practices. Your data is encrypted in transit and at rest. 
                We never store your business data - it lives securely in your own Google Sheet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '80px 40px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '24px' }}>
            Ready to Transform Your Business?
          </h3>
          <p style={{ fontSize: '20px', marginBottom: '40px', opacity: 0.95 }}>
            Join hundreds of businesses already using Medha ERP to streamline their operations
          </p>
          <button
            onClick={() => signIn('google', { callbackUrl: '/erp' })}
            style={{
              background: 'white',
              color: '#667eea',
              padding: '20px 50px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '20px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
            }}
          >
            Get Started for Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1e293b', color: 'white', padding: '60px 40px 30px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '40px',
            marginBottom: '40px'
          }}>
            {/* Company Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Image 
                  src="/medha-logo.png" 
                  alt="Medha Logo" 
                  width={40} 
                  height={40} 
                  style={{ borderRadius: '8px' }} 
                />
                <h4 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Medha ERP</h4>
              </div>
              <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                Smart business management platform for modern enterprises. Built with ❤️ by MKTDM Media.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h5 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Quick Links</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['Features', 'Pricing', 'Documentation', 'Support'].map((link, idx) => (
                  <li key={idx} style={{ marginBottom: '12px' }}>
                    <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h5 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Contact Us</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href="mailto:support@medhaerp.com" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                    support@medhaerp.com
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span style={{ color: '#94a3b8' }}>+91 98765 43210</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span style={{ color: '#94a3b8' }}>Raipur, Chhattisgarh, India</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h5 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Follow Us</h5>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[
                  { Icon: Twitter, href: '#' },
                  { Icon: Linkedin, href: '#' },
                  { Icon: Github, href: '#' }
                ].map(({ Icon, href }, idx) => (
                  <a
                    key={idx}
                    href={href}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: 'white' }} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            paddingTop: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              © 2026 Medha ERP by MKTDM Media Marketing OPC Pvt Ltd. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="/privacy" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>
                Privacy Policy
              </a>
              <a href="/terms" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
