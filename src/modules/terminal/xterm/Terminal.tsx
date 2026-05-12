import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Terminal as XTerm, type ITerminalOptions } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import styles from './Terminal.module.css';

export interface TerminalHandle {
  write: (data: string) => void;
  clear: () => void;
}

interface TerminalProps {
  onData: (data: string) => void;
  options?: Partial<ITerminalOptions>;
}

export const Terminal = forwardRef<TerminalHandle, TerminalProps>(
  ({ onData, options }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<XTerm | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);

    useEffect(() => {
      if (!containerRef.current) return;

      const terminal = new XTerm({
        theme: {
          background: '#0f172a',
          foreground: '#f1f5f9',
          cursor: '#3b82f6',
          cursorAccent: '#0f172a',
          selectionBackground: 'rgba(59, 130, 246, 0.3)',
        },
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        cursorBlink: true,
        cursorStyle: 'block',
        scrollback: 10000,
        convertEol: true,
        ...options,
      });

      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      terminal.loadAddon(fitAddon);
      terminal.loadAddon(webLinksAddon);
      terminal.open(containerRef.current);
      fitAddon.fit();

      terminal.onData(onData);

      terminalRef.current = terminal;
      fitAddonRef.current = fitAddon;

      const handleResize = () => {
        fitAddon.fit();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        terminal.dispose();
      };
    }, [onData, options]);

    useImperativeHandle(ref, () => ({
      write: (data: string) => {
        terminalRef.current?.write(data);
      },
      clear: () => {
        terminalRef.current?.clear();
      },
    }));

    return <div ref={containerRef} className={styles.terminal} />;
  }
);

Terminal.displayName = 'Terminal';
