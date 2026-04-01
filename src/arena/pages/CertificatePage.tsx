/**
 * @file CertificatePage.tsx
 * @description Public certificate verification page
 * @module arena/pages
 * @author SKAV TECH
 * @product Togetherly Arena
 */
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Download, Shield, Calendar } from 'lucide-react';

const CertificatePage = () => {
  const { code } = useParams();

  // Mock certificate data
  const cert = {
    name: 'Arjun Kumar',
    challenge: 'React JS Mastery',
    score: 87,
    grade: 'A',
    rank: 12,
    totalParticipants: 203,
    issuedAt: '2025-07-28',
    verificationCode: code || 'ARENA-2025-RJM-0012',
    verified: true,
  };

  return (
    <div className="min-h-screen bg-arena-black flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
        {/* Verification badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-arena-green" />
          <span className="text-sm text-arena-green font-medium">Verified Certificate</span>
        </div>

        {/* Certificate */}
        <div className="arena-card p-10 text-center relative overflow-hidden">
          {/* Decorative border */}
          <div className="absolute inset-3 border border-primary/20 rounded-2xl pointer-events-none" />

          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">SKAV TECH presents</p>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Togetherly Arena</h1>
          <p className="text-sm text-muted-foreground mb-8">Certificate of Achievement</p>

          <Award className="w-16 h-16 text-primary mx-auto mb-6" />

          <p className="text-sm text-muted-foreground mb-2">This is to certify that</p>
          <h2 className="font-display text-2xl font-bold text-primary mb-2">{cert.name}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            has successfully completed the <span className="text-foreground font-medium">{cert.challenge}</span> challenge
          </p>

          <div className="flex items-center justify-center gap-8 mb-8">
            <div>
              <p className="text-2xl font-bold text-primary">{cert.score}/100</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <p className="text-2xl font-bold text-arena-accent">#{cert.rank}</p>
              <p className="text-xs text-muted-foreground">of {cert.totalParticipants}</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <p className="text-2xl font-bold text-arena-green">{cert.grade}</p>
              <p className="text-xs text-muted-foreground">Grade</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {cert.issuedAt}</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {cert.verificationCode}</span>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button className="arena-btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CertificatePage;
