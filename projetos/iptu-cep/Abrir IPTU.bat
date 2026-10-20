@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo IPTU pelo CEP rodando em http://127.0.0.1:8765  (feche esta janela para encerrar)
py -m iptu_cep local
pause
