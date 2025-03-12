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
          FXperto es una plataforma de estrategias cambiarias que ayuda a empresas a optimizar la compra y venta de dólares con datos en tiempo real, análisis estratégico y alertas clave. No predecimos el mercado, pero sí te damos las herramientas para tomar decisiones informadas y proteger tu rentabilidad. Con FXperto, conviertes la incertidumbre cambiaria en una ventaja competitiva.
        </p>
        <p>
          Puedes aprender más sobre FXperto visitando la{' '}
          <Link
            className="font-medium underline underline-offset-4"
            href="www.fxperto.com"
            target="_blank"
          >
            página web
          </Link>
          .
        </p>
      </div>
    </motion.div>
  );
};
