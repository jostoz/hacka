import { motion } from 'framer-motion';
import Link from 'next/link';

const FxLogo = ({ size = 32 }: { size?: number }) => {
  return (
    <svg 
      width={size} 
      height={(size * 200) / 300} 
      viewBox="0 0 300 200" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="300" height="200" fill="transparent"/>
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <path d="M 100,70 L 150,70 M 100,70 L 100,150 M 100,110 L 140,110" />
        <path d="M 180,70 L 230,150 M 180,150 L 230,70" />
      </g>
    </svg>
  );
};

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center">
          <FxLogo size={64} />
        </p>
        <p>
          Bienvenido a{' '}
          <Link
            className="font-medium underline underline-offset-4"
            href="https://www.fxperto.com"
            target="_blank"
          >
            FXperto
          </Link>
          , tu plataforma de{' '}
          <code className="rounded-md bg-muted px-1 py-0.5">análisis cambiario</code>{' '}
          que te ayuda a tomar{' '}
          <code className="rounded-md bg-muted px-1 py-0.5">decisiones informadas</code>{' '}
          en la compra y venta de divisas.
        </p>
        <p className="text-sm text-muted-foreground">
          Datos en tiempo real · Análisis estratégico · Alertas clave
        </p>
        <details className="text-left">
          <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            Aviso Legal – Exención de Responsabilidad (Haz clic para ver)
          </summary>
          <div className="mt-2 p-4 text-xs text-muted-foreground bg-muted/50 rounded-lg max-h-48 overflow-y-auto">
            La información, datos y estadísticas proporcionados en esta aplicación, incluyendo aquellos relacionados con los tipos de cambio entre MXN y USD, se ofrecen únicamente con fines informativos y estadísticos. Esta aplicación no constituye ni pretende constituir una recomendación, asesoramiento financiero, de inversión o especulación, y no debe utilizarse como base para tomar decisiones financieras. El usuario es únicamente responsable del análisis y las decisiones que derive del uso de la información aquí contenida, asumiendo todos los riesgos inherentes a cualquier operación o inversión que realice. Se recomienda encarecidamente que, para cualquier decisión financiera o de inversión, el usuario consulte a asesores financieros calificados y verifique la información con las autoridades regulatorias correspondientes. Esta aplicación y su contenido se rigen por las normativas y regulaciones vigentes de organismos como la AMIB (Asociación Mexicana de Instituciones Bursátiles), la CNBV (Comisión Nacional Bancaria y de Valores), y cualquier otra entidad regulatoria aplicable. Ni los desarrolladores, ni los proveedores de datos, ni los asociados de esta aplicación serán responsables de las decisiones o acciones que el usuario pueda tomar basándose en esta información. El uso de esta aplicación implica la aceptación total de los términos aquí expuestos.
          </div>
        </details>
      </div>
    </motion.div>
  );
};
