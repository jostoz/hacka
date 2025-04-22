import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

const FxLogo = ({ size = 299 }: { size?: number }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 300 300" 
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-lg"
    >
      <rect width="300" height="300" fill="white"/>
      <g fill="none" stroke="#D0D0D0" strokeWidth="0.7">
        <path d="M 150,150 A 34,34 0 0 1 184,184 A 55,55 0 0 1 129,239 A 89,89 0 0 1 40,150 A 144,144 0 0 1 184,6"/>
        <rect x="95" y="95" width="144" height="89"/> 
        <rect x="95" y="95" width="89" height="55"/> 
        <rect x="150" y="95" width="34" height="55"/>
      </g>
      <circle cx="150" cy="150" r="89" fill="none" stroke="#757575" strokeWidth="1.6"/>
      <g fill="none" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round">
        <path d="M 116,95 L 116,205"/> 
        <path d="M 116,95 L 171,95"/> 
        <path d="M 116,150 L 150,150"/>
        <path d="M 171,95 L 205,205"/> 
        <path d="M 171,205 L 205,95"/>
      </g>
    </svg>
  );
};

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-4xl mx-auto md:mt-24 px-4"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="p-8 flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <FxLogo size={72} />
          <h1 className="text-3xl font-bold text-center">
            ¡Domina el Mercado de Divisas con{' '}
            <Link
              className="font-bold text-primary hover:text-primary/80 transition-colors"
              href="https://www.fxperto.com"
              target="_blank"
            >
              FXperto
            </Link>
            !
          </h1>
        </div>

        <p className="text-lg text-center max-w-2xl">
          Tu{' '}
          <code className="rounded-md bg-primary/10 px-2 py-1 font-semibold">arma secreta</code>{' '}
          para{' '}
          <code className="rounded-md bg-primary/10 px-2 py-1 font-semibold">operaciones ganadoras</code>{' '}
          en el mercado forex.
        </p>

        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground font-medium">
          <span className="flex items-center gap-1">
            <span className="text-primary">🔥</span> Datos en tiempo real
          </span>
          <span className="flex items-center gap-1">
            <span className="text-primary">💡</span> Análisis estratégico
          </span>
          <span className="flex items-center gap-1">
            <span className="text-primary">⚡</span> Alertas clave
          </span>
        </div>

        <details className="w-full max-w-2xl">
          <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors font-medium flex items-center gap-2">
            <span className="text-primary">⚖️</span> Aviso Legal – Exención de Responsabilidad
          </summary>
          <div className="mt-4 p-6 text-sm text-muted-foreground bg-muted/50 rounded-lg max-h-64 overflow-y-auto leading-relaxed">
            La información, datos y estadísticas proporcionados en esta aplicación, incluyendo aquellos relacionados con los tipos de cambio entre MXN y USD, se ofrecen únicamente con fines informativos y estadísticos. Esta aplicación no constituye ni pretende constituir una recomendación, asesoramiento financiero, de inversión o especulación, y no debe utilizarse como base para tomar decisiones financieras. El usuario es únicamente responsable del análisis y las decisiones que derive del uso de la información aquí contenida, asumiendo todos los riesgos inherentes a cualquier operación o inversión que realice. Se recomienda encarecidamente que, para cualquier decisión financiera o de inversión, el usuario consulte a asesores financieros calificados y verifique la información con las autoridades regulatorias correspondientes. Esta aplicación y su contenido se rigen por las normativas y regulaciones vigentes de organismos como la AMIB (Asociación Mexicana de Instituciones Bursátiles), la CNBV (Comisión Nacional Bancaria y de Valores), y cualquier otra entidad regulatoria aplicable. Ni los desarrolladores, ni los proveedores de datos, ni los asociados de esta aplicación serán responsables de las decisiones o acciones que el usuario pueda tomar basándose en esta información. El uso de esta aplicación implica la aceptación total de los términos aquí expuestos.
          </div>
        </details>
      </Card>
    </motion.div>
  );
};
