import glob, os
files = ['index.html'] + glob.glob('*/index.html') + ['css/style.css', 'js/main.js']
bad = []
def check(text, fname):
    for term in ['askOverlay','typingOverlay','Ask anything','Typing test','person viewing now',
                 'openAsk','openTyping','id="github"','ghGraph','06 — github']:
        if term in text:
            bad.append((fname, 'RESIDUAL: ' + term))
    if '\ufffd' in text:
        bad.append((fname, 'MOJIBAKE replacement char'))
    if 'Ã' in text:
        bad.append((fname, 'MOJIBAKE A-tilde'))

for f in files:
    t = open(f, encoding='utf-8').read()
    check(t, f)

# home-specific checks
home = open('index.html', encoding='utf-8').read()
dc = home.count('deck-card ')
print('deck-card occurrences in index.html:', dc, '(expect 3 articles -> look for is-center/is-left/is-right)')
print('nav border present in sidebar:', 'inset-y-0 left-0 z-50 hidden w-56 flex-col bg-white' in home and 'border-r border-gray-200 bg-white px-7' in home)
print('home still has #projects href:', 'href="#projects"' in home)
print('home has section/ links:', all(('href="%s/"'%n) in home for n in ['projects','experience','stack','certifications','gallery','contact']))

# section page checks
for sec in ['projects','experience','stack','certifications','gallery','contact']:
    t = open(sec+'/index.html', encoding='utf-8').read()
    for term in ['askOverlay','typingOverlay','person viewing now','href="#projects"','href="#experience"','id="github"']:
        if term in t:
            bad.append((sec+'/index.html', 'RESIDUAL: '+term))
    print(sec, 'has ../section/ links:', all(('href="../%s/"'%n) in t for n in ['projects','experience','stack','certifications','gallery','contact']))

print('\n=== PROBLEMS ===')
print('\n'.join('%s : %s' % b for b in bad) if bad else 'NONE — all clean')
