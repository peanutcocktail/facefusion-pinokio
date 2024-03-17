function install(kernel)
{
	const { platform, gpu } = kernel;

	if (platform === 'darwin')
	{
		return 'python install.py --onnxruntime default --skip-venv';
	}
	if ([ 'linux', 'win32' ].includes(platform) && gpu === 'nvidia')
	{
		return 'python install.py --onnxruntime cuda-11.8 --skip-venv';
	}
	if (gpu === 'amd')
	{
		if (platform === 'linux')
		{
			return 'python install.py --onnxruntime rocm-5.4.2 --skip-venv';
		}
		if (platform === 'win32')
		{
			return 'python install.py --onnxruntime directml --skip-venv';
		}
	}
	return 'python install.py --onnxruntime default --skip-venv';
}

module.exports = async kernel =>
{
	const config =
	{
		run:
		[
      {
        when: '{{gpu === "nvidia"}}',
				method: 'shell.run',
				params:
				{
          conda: { name: '{{ gpu === "nvidia" ? "cu118": "base"}}' },
					message: [
            'conda install -y --override-channels cudatoolkit=11.8.0 cudnn=8.4.1.50 -c conda-forge'
          ]
				}
			},
			{
				method: 'shell.run',
				params:
				{
					message: 'git clone https://github.com/facefusion/facefusion --branch 2.4.0 --single-branch'
				}
			},
			{
				method: 'shell.run',
				params:
				{
					env:
					{
						PYTHONNOUSERSITE: 'True'
					},
					message: install(kernel),
					path: 'facefusion',
          conda: { name: '{{ gpu === "nvidia" ? "cu118": "base"}}' },
					venv: 'env'
				}
			},
			{
				method: 'input',
				params:
				{
					title: 'Install complete',
					description: 'Go back to the dashboard and launch the application.'
				}
			},
			{
				method: 'browser.open',
				params:
				{
					uri: '/?selected=facefusion'
				}
			}
		]
	};

	return config;
};
