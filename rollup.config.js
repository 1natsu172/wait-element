import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
  input: 'index.js',
  output: [
    {
      file: 'dist/cjs/index.js',
      format: 'cjs'
    },
    {
      file: 'dist/es/index.js',
      format: 'es'
    }
  ],
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true
    }),

    commonjs({
      sourceMap: false,  // Default: true
    }),

    babel({
      plugins: ['external-helpers']
    })
  ]
};