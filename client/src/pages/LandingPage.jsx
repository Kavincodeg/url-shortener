import { Link } from 'react-router-dom';
import { Zap, Link2, BarChart3, QrCode, Shield, ArrowRight, Check, TrendingUp, Globe, Clock } from 'lucide-react';

const features = [
  { icon: Link2, title: 'Instant Short Links', desc: 'Shorten long URLs in seconds with our blazing fast service.' },
  { icon: BarChart3, title: 'Powerful Analytics', desc: 'Track clicks, locations, devices and reach more in real time.' },
  { icon: QrCode, title: 'Custom & Branded', desc: 'Use custom aliases and make your brand shine through every link.' },
  { icon: Shield, title: 'Secure & Reliable', desc: 'Your links are safe with enterprise-grade security, always on.' },
];

const stats = [
  { value: '2M+', label: 'Links Created' },
  { value: '50M+', label: 'Clicks Tracked' },
  { value: '180+', label: 'Countries' },
  { value: '99.9%', label: 'Uptime' },
];

const LandingPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      {/* Navbar */}
      <nav className="landing-nav">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Linko</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {['Features', 'Pricing', 'How it works', 'About'].map(item => (
              <a key={item} href="#" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                {item}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login" className="btn-secondary" style={{ height: 36 }}>Log in</Link>
            <Link to="/register" className="btn-primary" style={{ height: 36 }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient" style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div className="animate-fade-in">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'white', border: '1px solid var(--border)', borderRadius: 100, padding: '0.25rem 0.875rem 0.25rem 0.5rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, boxShadow: 'var(--card-shadow)' }}>
              <span style={{ background: 'var(--primary)', color: 'white', borderRadius: 100, padding: '0.125rem 0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>NEW</span>
              Fast · Secure · Reliable
            </div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Shorten links.<br />
              <span className="gradient-text">Track everything.</span>
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 480 }}>
              Create powerful short links, customize them, share anywhere, and track clicks in real time with detailed analytics.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <Link to="/register" className="btn-primary" style={{ height: 44, padding: '0 1.5rem', fontSize: '0.9375rem', gap: '0.5rem' }}>
                Get Started Free <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn-secondary" style={{ height: 44, padding: '0 1.5rem', fontSize: '0.9375rem' }}>
                View Live Demo
              </Link>
            </div>
            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex' }}>
                {['#4F46E5', '#7C3AED', '#2563EB'].map((c, i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: '2px solid white', marginLeft: i === 0 ? 0 : -8 }} />
                ))}
              </div>
              <span><strong style={{ color: 'var(--text-primary)' }}>4.9/5</strong> from 2,500+ users</span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="animate-float" style={{ position: 'relative' }}>
            <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 20px 60px rgba(79,70,229,0.12)', border: '1px solid var(--border)' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Short link created! 🎉</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', background: '#F8FAFC', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <Zap size={14} color="var(--primary)" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>linkly.io/awesome</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                {[
                  { label: 'Total Clicks', value: '2,543', trend: '+18%', icon: TrendingUp },
                  { label: 'Countries', value: '48', trend: 'Global', icon: Globe },
                ].map(({ label, value, trend, icon: Icon }) => (
                  <div key={label} style={{ padding: '0.875rem', background: '#F8FAFC', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>{trend}</div>
                  </div>
                ))}
              </div>
              {/* Mini chart visual */}
              <div style={{ height: 60, background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', borderRadius: 8, display: 'flex', alignItems: 'flex-end', padding: '0 0.5rem 0.5rem', gap: 4 }}>
                {[30, 50, 40, 70, 60, 90, 80].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(180deg, #4F46E5, #7C3AED)', borderRadius: '3px 3px 0 0', opacity: 0.8 + i * 0.03 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '2rem 1.5rem', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
          {stats.map(({ value, label }) => (
            <div key={label}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why choose Linko */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Why choose Linko?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', maxWidth: 480, margin: '0 auto' }}>
              Everything you need to manage links and understand your audience.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card card-hover" style={{ padding: '1.5rem' }}>
                <div style={{ width: 44, height: 44, background: 'var(--primary-light)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Icon size={20} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '5rem 1.5rem', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>
            Ready to grow smarter?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: '2rem' }}>
            Join thousands of creators, marketers and businesses using Linko.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/register" style={{ background: 'white', color: 'var(--primary)', padding: '0.75rem 2rem', borderRadius: 8, fontWeight: 700, fontSize: '0.9375rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Start for Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={12} color="white" />
            </div>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Linko</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>© 2024 Linko. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
