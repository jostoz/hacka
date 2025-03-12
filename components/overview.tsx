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
      </div>
    </motion.div>
  );
};
