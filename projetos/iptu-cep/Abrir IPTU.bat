@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Abrindo IPTU pelo CEP no navegador... (feche esta janela para encerrar)
py -m iptu_cep web
pause
