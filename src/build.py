t=open('./template.html').read()
for k,f in [('/*AVCSS*/','avatars.css'),('/*GAMECSS*/','game.css'),('/*AVATARS*/','avatars.js'),('/*DATA*/','data.js'),('/*QRLIB*/','qrlib.js'),('/*MINIGAMES*/','minigames.js'),('/*ONLINE*/','online.js'),('/*PEERROOM*/','peerroom.js')]:
    t=t.replace(k,open('./'+f).read(),1)
open('../index.html','w').write(t)
