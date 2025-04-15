import { motion } from 'framer-motion';
import Link from 'next/link';

import { MessageIcon, VercelIcon } from './icons';

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
        <p className="flex flex-row justify-center gap-4 items-center">
          <VercelIcon size={32} />
          <span>+</span>
          <MessageIcon size={32} />
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
          , una plataforma de{' '}
          <code className="rounded-md bg-muted px-1 py-0.5">estrategias cambiarias</code>{' '}
          que ayuda a empresas a optimizar la compra y venta de dólares con{' '}
          <code className="rounded-md bg-muted px-1 py-0.5">datos en tiempo real</code>,{' '}
          <code className="rounded-md bg-muted px-1 py-0.5">análisis estratégico</code> y{' '}
          <code className="rounded-md bg-muted px-1 py-0.5">alertas clave</code>. No predecimos el mercado, pero sí te damos las herramientas para{' '}
          <code className="rounded-md bg-muted px-1 py-0.5">tomar decisiones informadas</code> y{' '}
          <code className="rounded-md bg-muted px-1 py-0.5">proteger tu rentabilidad</code>.
        </p>
        <p>
          Con FXperto, conviertes la{' '}
          <code className="rounded-md bg-muted px-1 py-0.5">incertidumbre cambiaria</code> en una{' '}
          <code className="rounded-md bg-muted px-1 py-0.5">ventaja competitiva</code>.
        </p>
        <p className="text-xs text-muted-foreground">
          Aviso Legal – Exención de Responsabilidad: La información, datos y estadísticas proporcionados en esta aplicación, incluyendo aquellos relacionados con los tipos de cambio entre MXN y USD, se ofrecen únicamente con fines informativos y estadísticos. Esta aplicación no constituye ni pretende constituir una recomendación, asesoramiento financiero, de inversión o especulación, y no debe utilizarse como base para tomar decisiones financieras. El usuario es únicamente responsable del análisis y las decisiones que derive del uso de la información aquí contenida, asumiendo todos los riesgos inherentes a cualquier operación o inversión que realice. Se recomienda encarecidamente que, para cualquier decisión financiera o de inversión, el usuario consulte a asesores financieros calificados y verifique la información con las autoridades regulatorias correspondientes. Esta aplicación y su contenido se rigen por las normativas y regulaciones vigentes de organismos como la AMIB (Asociación Mexicana de Instituciones Bursátiles), la CNBV (Comisión Nacional Bancaria y de Valores), y cualquier otra entidad regulatoria aplicable. Ni los desarrolladores, ni los proveedores de datos, ni los asociados de esta aplicación serán responsables de las decisiones o acciones que el usuario pueda tomar basándose en esta información. El uso de esta aplicación implica la aceptación total de los términos aquí expuestos.
        </p>
      </div>
    </motion.div>
  );
};
