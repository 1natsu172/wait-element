import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
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
			mainFields: ['jsnext', 'module', 'main']
		}),

		commonjs({
			sourceMap: false // Default: true
		}),

		babel({
			presets: [
				[
					'@babel/preset-env',
					{
						modules: false
					}
				]
			],
			plugins: [
				'@babel/plugin-transform-object-assign',
				'@babel/external-helpers'
			]
		})
	]
};
