// Type declarations for CSS files imported by template components

// CSS Modules (e.g. import classes from './foo.module.css')
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Plain CSS side-effect imports (e.g. import '@/global.css')
declare module '*.css' {}
