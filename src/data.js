// Each item: [display name, stat, ...aliases]
// Category flags: people (surname alone counts), ties (equal stats share a rank), exact (no typo matching)
const GROUPS = [
{id:'geo', name:'Geography', cats:[
  {id:'area', t:'Largest countries by area', n:'Total area, including inland water.', items:[
    ['Russia','17.1m km²','russian federation'],['Canada','10.0m km²'],
    ['United States','9.8m km²','usa','us','america','united states of america'],['China','9.6m km²','prc'],
    ['Brazil','8.5m km²'],['Australia','7.7m km²'],['India','3.3m km²'],['Argentina','2.8m km²'],
    ['Kazakhstan','2.7m km²'],['Algeria','2.4m km²']]},
  {id:'pop', t:'Most populous countries', n:'UN estimates for 2026.', items:[
    ['India','1.48bn'],['China','1.41bn','prc'],['United States','349m','usa','us','america'],
    ['Indonesia','288m'],['Pakistan','259m'],['Nigeria','242m'],['Brazil','214m'],
    ['Bangladesh','178m'],['Russia','143m','russian federation'],['Ethiopia','139m']]},
  {id:'mtn', t:'Tallest mountains on Earth', n:'Height above sea level.', items:[
    ['Everest','8,849 m','mount everest','qomolangma','sagarmatha'],['K2','8,611 m','godwin austen','mount godwin austen'],
    ['Kangchenjunga','8,586 m','kanchenjunga'],['Lhotse','8,516 m'],['Makalu','8,485 m'],['Cho Oyu','8,188 m'],
    ['Dhaulagiri','8,167 m','dhaulagiri i'],['Manaslu','8,163 m'],['Nanga Parbat','8,126 m'],['Annapurna','8,091 m','annapurna i']]},
  {id:'river', t:'Longest rivers in the world', n:'Common reference lengths; Nile vs Amazon is still debated.', items:[
    ['Nile','6,650 km'],['Amazon','6,400 km'],['Yangtze','6,300 km','chang jiang'],
    ['Mississippi–Missouri','6,275 km','mississippi','missouri'],['Yenisei','5,539 km','yenisey'],
    ['Yellow River','5,464 km','yellow','huang he','huanghe'],['Ob–Irtysh','5,410 km','ob','irtysh'],
    ['Paraná','4,880 km','parana'],['Congo','4,700 km','zaire'],['Amur','4,444 km','heilong','heilongjiang']]},
  {id:'states', t:'Largest US states by area', n:'Total area, including water.', items:[
    ['Alaska','1.72m km²'],['Texas','696k km²'],['California','424k km²'],['Montana','381k km²'],
    ['New Mexico','315k km²'],['Arizona','295k km²'],['Nevada','286k km²'],['Colorado','270k km²'],
    ['Oregon','255k km²'],['Wyoming','253k km²']]},
  {id:'africa', t:'Largest countries in Africa', n:'Total area.', items:[
    ['Algeria','2.38m km²'],['DR Congo','2.34m km²','democratic republic of the congo','drc','congo','dr congo','zaire','democratic republic of congo'],
    ['Sudan','1.86m km²'],['Libya','1.76m km²'],['Chad','1.28m km²'],['Niger','1.27m km²'],
    ['Angola','1.25m km²'],['Mali','1.24m km²'],['South Africa','1.22m km²'],['Ethiopia','1.10m km²']]},
  {id:'islands', t:'Largest islands in the world', n:'Australia counts as a continent, not an island.', items:[
    ['Greenland','2.13m km²'],['New Guinea','786k km²','papua','papua new guinea'],['Borneo','743k km²'],
    ['Madagascar','587k km²'],['Baffin Island','507k km²','baffin'],['Sumatra','473k km²','sumatera'],
    ['Honshu','227k km²'],['Victoria Island','217k km²','victoria'],['Great Britain','209k km²','britain'],
    ['Ellesmere Island','196k km²','ellesmere']]},
  {id:'lakes', t:'Largest lakes by area', n:'Surface area; Michigan and Huron counted separately.', items:[
    ['Caspian Sea','371k km²','caspian'],['Lake Superior','82.1k km²'],['Lake Victoria','59.9k km²'],
    ['Lake Huron','59.6k km²'],['Lake Michigan','58.0k km²'],['Lake Tanganyika','32.6k km²'],
    ['Lake Baikal','31.5k km²'],['Great Bear Lake','31.0k km²','great bear'],['Lake Malawi','29.5k km²','lake nyasa','nyasa'],
    ['Great Slave Lake','27.0k km²','great slave']]},
  {id:'eu', t:'Largest EU countries by area', n:'France means metropolitan France only.', items:[
    ['France','552k km²'],['Spain','506k km²'],['Sweden','450k km²'],['Germany','358k km²'],
    ['Finland','338k km²'],['Poland','313k km²'],['Italy','302k km²'],['Romania','238k km²'],
    ['Greece','132k km²'],['Bulgaria','111k km²']]},
  {id:'samerica', t:'Largest countries in South America', n:'Total area.', items:[
    ['Brazil','8.52m km²'],['Argentina','2.78m km²'],['Peru','1.29m km²'],['Colombia','1.14m km²'],
    ['Bolivia','1.10m km²'],['Venezuela','916k km²'],['Chile','756k km²'],['Paraguay','407k km²'],
    ['Ecuador','284k km²'],['Guyana','215k km²']]}
]},
{id:'sport', name:'Sport', cats:[
  {id:'pl', t:'Premier League all-time top scorers', n:'Most Premier League goals, as of the 2026–27 season.', people:true, items:[
    ['Alan Shearer','260 goals'],['Harry Kane','213 goals'],['Wayne Rooney','208 goals'],
    ['Mohamed Salah','192 goals','mo salah'],['Andy Cole','187 goals','andrew cole'],['Sergio Agüero','184 goals','kun aguero'],
    ['Frank Lampard','177 goals'],['Thierry Henry','175 goals'],['Robbie Fowler','163 goals'],['Jermain Defoe','162 goals']]},
  {id:'plapps', t:'Most Premier League appearances', n:'Milner retired in 2026 as the record holder.', people:true, items:[
    ['James Milner','658 apps'],['Gareth Barry','653 apps'],['Ryan Giggs','632 apps'],['Frank Lampard','609 apps'],
    ['David James','572 apps'],['Gary Speed','535 apps'],['Emile Heskey','516 apps'],['Mark Schwarzer','514 apps'],
    ['Jamie Carragher','508 apps'],['Phil Neville','505 apps']]},
  {id:'plast', t:'Premier League all-time assists', n:'Most Premier League assists, as of the 2026–27 season.', people:true, ties:true, items:[
    ['Ryan Giggs','162'],['Kevin De Bruyne','119','de bruyne','kdb'],['Cesc Fàbregas','111','fabregas'],
    ['Wayne Rooney','103'],['Frank Lampard','102'],['Dennis Bergkamp','94'],['Mohamed Salah','94','mo salah'],
    ['David Silva','93'],['Steven Gerrard','92'],['James Milner','90']]},
  {id:'wc', t:'Men\'s World Cup all-time top scorers', n:'After the 2026 World Cup. Tied players share a rank.', people:true, ties:true, items:[
    ['Kylian Mbappé','22 goals','mbappe'],['Lionel Messi','21 goals'],['Miroslav Klose','16 goals'],
    ['Ronaldo','15 goals','ronaldo nazario','r9','ronaldo brazil'],['Gerd Müller','14 goals','muller','gerd muller'],
    ['Harry Kane','14 goals'],['Just Fontaine','13 goals'],['Pelé','12 goals','pele'],
    ['Sándor Kocsis','11 goals','kocsis','sandor kocsis'],['Jürgen Klinsmann','11 goals','klinsmann','jurgen klinsmann']]},
  {id:'engcaps', t:'Most-capped England men\'s players', n:'Kane broke Shilton\'s record in November 2026.', people:true, ties:true, items:[
    ['Harry Kane','126+ caps'],['Peter Shilton','125 caps'],['Wayne Rooney','120 caps'],['David Beckham','115 caps'],
    ['Steven Gerrard','114 caps'],['Bobby Moore','108 caps'],['Ashley Cole','107 caps','cole'],
    ['Bobby Charlton','106 caps','charlton'],['Frank Lampard','106 caps'],['Billy Wright','105 caps']]},
  {id:'enggoals', t:'England men\'s all-time top scorers', n:'Kane is still adding to his total.', people:true, ties:true, items:[
    ['Harry Kane','91+ goals'],['Wayne Rooney','53 goals'],['Bobby Charlton','49 goals'],['Gary Lineker','48 goals'],
    ['Jimmy Greaves','44 goals'],['Michael Owen','40 goals'],['Tom Finney','30 goals'],['Nat Lofthouse','30 goals'],
    ['Alan Shearer','30 goals'],['Vivian Woodward','29 goals']]},
  {id:'bdor', t:'Ballon d\'Or winners 2000–2009, in order', n:'Ten different winners in ten years.', people:true, items:[
    ['Luís Figo','2000','figo','luis figo'],['Michael Owen','2001'],['Ronaldo (Brazil)','2002','ronaldo','ronaldo nazario','r9'],
    ['Pavel Nedvěd','2003','nedved'],['Andriy Shevchenko','2004','shevchenko','andrei shevchenko'],
    ['Ronaldinho','2005'],['Fabio Cannavaro','2006','cannavaro'],['Kaká','2007','kaka'],
    ['Cristiano Ronaldo','2008','ronaldo','cr7'],['Lionel Messi','2009']]},
  {id:'wchosts', t:'First ten men\'s World Cup hosts, in order', n:'From 1930 onwards.', items:[
    ['Uruguay','1930'],['Italy','1934'],['France','1938'],['Brazil','1950'],['Switzerland','1954'],
    ['Sweden','1958'],['Chile','1962'],['England','1966'],['Mexico','1970'],['West Germany','1974','germany']]},
  {id:'nba', t:'NBA all-time leading scorers', n:'Regular-season points; + means still playing.', people:true, items:[
    ['LeBron James','43.6k+ pts','lebron'],['Kareem Abdul-Jabbar','38,387 pts','kareem','abdul jabbar','jabbar'],
    ['Karl Malone','36,928 pts'],['Kobe Bryant','33,643 pts','kobe'],['Kevin Durant','32.9k+ pts','kd'],
    ['Michael Jordan','32,292 pts','mj'],['Dirk Nowitzki','31,560 pts','dirk'],['Wilt Chamberlain','31,419 pts','wilt'],
    ['James Harden','29.6k+ pts'],['Shaquille O\'Neal','28,596 pts','shaq','oneal','o neal','shaquille oneal']]},
  {id:'paris', t:'Paris 2024 Olympics medal table', n:'Official order: golds first, then silvers.', items:[
    ['United States','40 gold','usa','us','america','team usa'],['China','40 gold'],['Japan','20 gold'],
    ['Australia','18 gold'],['France','16 gold'],['Netherlands','15 gold','holland'],
    ['Great Britain','14 gold','gb','team gb','uk','united kingdom','britain'],['South Korea','13 gold','korea'],
    ['Italy','12 gold'],['Germany','12 gold']]}
]},
{id:'music', name:'Music', cats:[
  {id:'spart', t:'Spotify\'s most-streamed artists ever', n:'Spotify\'s own all-time list, April 2026.', items:[
    ['Taylor Swift','','taylor','swift'],['Bad Bunny',''],['Drake',''],['The Weeknd','','weeknd'],
    ['Ariana Grande','','ariana'],['Ed Sheeran','','sheeran'],['Justin Bieber','','bieber'],
    ['Billie Eilish','','billie','eilish'],['Eminem','','slim shady'],['Kanye West','','kanye','ye']]},
  {id:'spsongs', t:'Spotify\'s most-streamed songs ever', n:'Spotify\'s own all-time list, April 2026.', items:[
    ['Blinding Lights','The Weeknd'],['Shape of You','Ed Sheeran'],['Sweater Weather','The Neighbourhood'],
    ['Starboy','The Weeknd ft. Daft Punk'],['As It Was','Harry Styles'],['Someone You Loved','Lewis Capaldi'],
    ['Sunflower','Post Malone & Swae Lee'],['One Dance','Drake ft. Wizkid & Kyla'],['Perfect','Ed Sheeran'],
    ['Stay','The Kid LAROI & Justin Bieber']]},
  {id:'taylor', t:'Taylor Swift\'s first ten albums, in order', n:'Studio albums, original releases.', items:[
    ['Taylor Swift','2006','debut','self titled'],['Fearless','2008'],['Speak Now','2010'],['Red','2012'],
    ['1989','2014'],['Reputation','2017'],['Lover','2019'],['Folklore','2020'],['Evermore','2020'],['Midnights','2022']]},
  {id:'em', t:'Eminem\'s first ten albums, in order', n:'Solo studio albums.', items:[
    ['Infinite','1996'],['The Slim Shady LP','1999','slim shady lp','slim shady'],
    ['The Marshall Mathers LP','2000','marshall mathers lp','marshall mathers','mmlp'],['The Eminem Show','2002','eminem show'],
    ['Encore','2004'],['Relapse','2009'],['Recovery','2010'],
    ['The Marshall Mathers LP 2','2013','marshall mathers lp 2','mmlp2','mmlp 2','marshall mathers 2'],
    ['Revival','2017'],['Kamikaze','2018']]},
  {id:'kanye', t:'Kanye West\'s first ten albums, in order', n:'Solo studio albums (no collaborations).', items:[
    ['The College Dropout','2004','college dropout'],['Late Registration','2005'],['Graduation','2007'],
    ['808s & Heartbreak','2008','808s','808s and heartbreak','808 and heartbreak'],
    ['My Beautiful Dark Twisted Fantasy','2010','mbdtf','dark twisted fantasy'],['Yeezus','2013'],
    ['The Life of Pablo','2016','life of pablo','tlop'],['Ye','2018'],['Jesus Is King','2019'],['Donda','2021']]},
  {id:'jayz', t:'Jay-Z\'s first ten albums, in order', n:'Solo studio albums.', items:[
    ['Reasonable Doubt','1996'],['In My Lifetime, Vol. 1','1997','in my lifetime','vol 1','volume 1','in my lifetime vol 1'],
    ['Vol. 2… Hard Knock Life','1998','vol 2','volume 2','hard knock life'],
    ['Vol. 3… Life and Times of S. Carter','1999','vol 3','volume 3','life and times of s carter'],
    ['The Dynasty: Roc La Familia','2000','dynasty','roc la familia'],['The Blueprint','2001','blueprint'],
    ['The Blueprint 2','2002','blueprint 2','the gift and the curse'],['The Black Album','2003','black album'],
    ['Kingdom Come','2006'],['American Gangster','2007']]},
  {id:'nas', t:'Nas\'s first ten albums, in order', n:'Studio albums.', items:[
    ['Illmatic','1994'],['It Was Written','1996'],['I Am…','1999','i am'],['Nastradamus','1999'],
    ['Stillmatic','2001'],['God\'s Son','2002'],['Street\'s Disciple','2004'],['Hip Hop Is Dead','2006'],
    ['Untitled','2008'],['Life Is Good','2012']]},
  {id:'coldplay', t:'Coldplay\'s ten albums, in order', n:'Studio albums.', items:[
    ['Parachutes','2000'],['A Rush of Blood to the Head','2002','rush of blood to the head','rush of blood'],
    ['X&Y','2005','xy','x and y','x y'],['Viva la Vida','2008','viva la vida or death and all his friends'],
    ['Mylo Xyloto','2011'],['Ghost Stories','2014'],['A Head Full of Dreams','2015','head full of dreams'],
    ['Everyday Life','2019'],['Music of the Spheres','2021'],['Moon Music','2024']]},
  {id:'madonna', t:'Madonna\'s first ten albums, in order', n:'Studio albums.', items:[
    ['Madonna','1983','debut','self titled'],['Like a Virgin','1984'],['True Blue','1986'],['Like a Prayer','1989'],
    ['Erotica','1992'],['Bedtime Stories','1994'],['Ray of Light','1998'],['Music','2000'],['American Life','2003'],
    ['Confessions on a Dance Floor','2005','confessions']]},
  {id:'beatles', t:'The Beatles\' first ten albums, in order', n:'UK studio albums (Magical Mystery Tour was an EP in the UK).', items:[
    ['Please Please Me','1963'],['With the Beatles','1963'],['A Hard Day\'s Night','1964','hard days night'],
    ['Beatles for Sale','1964'],['Help!','1965'],['Rubber Soul','1965'],['Revolver','1966'],
    ['Sgt. Pepper\'s Lonely Hearts Club Band','1967','sgt pepper','sgt peppers','sergeant pepper','sergeant peppers'],
    ['The White Album','1968','white album','the beatles'],['Yellow Submarine','1969']]}
]},
{id:'history', name:'History', cats:[
  {id:'potus1', t:'The first ten US presidents, in order', n:'Year each took office.', people:true, items:[
    ['George Washington','1789'],['John Adams','1797'],['Thomas Jefferson','1801'],['James Madison','1809'],
    ['James Monroe','1817'],['John Quincy Adams','1825','jqa','quincy adams'],['Andrew Jackson','1829'],
    ['Martin Van Buren','1837','van buren'],['William Henry Harrison','1841','harrison','william harrison'],['John Tyler','1841']]},
  {id:'potus2', t:'US presidents from Truman to Clinton', n:'In order, year each took office.', people:true, items:[
    ['Harry Truman','1945'],['Dwight Eisenhower','1953','ike'],['John F. Kennedy','1961','jfk','john kennedy'],
    ['Lyndon B. Johnson','1963','lbj','lyndon johnson'],['Richard Nixon','1969'],['Gerald Ford','1974'],
    ['Jimmy Carter','1977'],['Ronald Reagan','1981'],['George H. W. Bush','1989','george bush','bush senior','george hw bush'],
    ['Bill Clinton','1993']]},
  {id:'ukpm1', t:'UK prime ministers from Churchill (1940)', n:'In order of first taking office.', people:true, items:[
    ['Winston Churchill','1940'],['Clement Attlee','1945'],['Anthony Eden','1955'],['Harold Macmillan','1957'],
    ['Alec Douglas-Home','1963','douglas home','home'],['Harold Wilson','1964'],['Edward Heath','1970','ted heath'],
    ['James Callaghan','1976','jim callaghan'],['Margaret Thatcher','1979'],['John Major','1990']]},
  {id:'ukpm2', t:'The last ten UK prime ministers', n:'Earliest first, up to Andy Burnham (July 2026).', people:true, items:[
    ['John Major','1990'],['Tony Blair','1997'],['Gordon Brown','2007'],['David Cameron','2010'],
    ['Theresa May','2016'],['Boris Johnson','2019'],['Liz Truss','2022'],['Rishi Sunak','2022'],
    ['Keir Starmer','2024'],['Andy Burnham','2026']]},
  {id:'mon', t:'The last ten British monarchs', n:'Earliest first. Use numbers: George 3 or George III.', exact:true, items:[
    ['George III','1760','george 3','george the third','george third'],['George IV','1820','george 4','george the fourth','george fourth'],
    ['William IV','1830','william 4','william the fourth','william'],['Victoria','1837','queen victoria'],
    ['Edward VII','1901','edward 7','edward the seventh'],['George V','1910','george 5','george the fifth','george fifth'],
    ['Edward VIII','1936','edward 8','edward the eighth'],['George VI','1936','george 6','george the sixth','george sixth'],
    ['Elizabeth II','1952','elizabeth 2','elizabeth the second','queen elizabeth','elizabeth'],
    ['Charles III','2022','charles 3','charles the third','king charles','charles']]},
  {id:'moon', t:'The ten first people to walk on the Moon', n:'In order of their landings.', people:true, items:[
    ['Neil Armstrong','Apollo 11'],['Buzz Aldrin','Apollo 11'],['Pete Conrad','Apollo 12','charles conrad'],
    ['Alan Bean','Apollo 12'],['Alan Shepard','Apollo 14'],['Edgar Mitchell','Apollo 14'],
    ['David Scott','Apollo 15','dave scott'],['James Irwin','Apollo 15','jim irwin'],['John Young','Apollo 16'],
    ['Charlie Duke','Apollo 16','charles duke']]},
  {id:'space', t:'The first ten people in space', n:'In order, 1961–63.', people:true, items:[
    ['Yuri Gagarin','Vostok 1'],['Alan Shepard','Freedom 7'],['Gus Grissom','Liberty Bell 7','virgil grissom'],
    ['Gherman Titov','Vostok 2'],['John Glenn','Friendship 7'],['Scott Carpenter','Aurora 7'],
    ['Andriyan Nikolayev','Vostok 3','nikolaev'],['Pavel Popovich','Vostok 4'],['Wally Schirra','Sigma 7','walter schirra'],
    ['Gordon Cooper','Faith 7']]},
  {id:'states13', t:'The first ten US states', n:'In order of ratifying the Constitution.', items:[
    ['Delaware','Dec 1787'],['Pennsylvania','Dec 1787'],['New Jersey','Dec 1787'],['Georgia','Jan 1788'],
    ['Connecticut','Jan 1788'],['Massachusetts','Feb 1788'],['Maryland','Apr 1788'],['South Carolina','May 1788'],
    ['New Hampshire','Jun 1788'],['Virginia','Jun 1788']]},
  {id:'rome', t:'The first ten Roman emperors', n:'In order, with the year each took power.', people:true, items:[
    ['Augustus','27 BC','octavian'],['Tiberius','AD 14'],['Caligula','AD 37','gaius'],['Claudius','AD 41'],
    ['Nero','AD 54'],['Galba','AD 68'],['Otho','AD 69'],['Vitellius','AD 69'],['Vespasian','AD 69'],['Titus','AD 79']]},
  {id:'olyhosts', t:'First ten countries to host the Summer Olympics', n:'In order of first hosting.', items:[
    ['Greece','1896'],['France','1900'],['United States','1904','usa','us','america'],
    ['United Kingdom','1908','uk','great britain','britain','england'],['Sweden','1912'],['Belgium','1920'],
    ['Netherlands','1928','holland'],['Germany','1936'],['Finland','1952'],['Australia','1956']]}
]},
{id:'impossible', name:'Impossible', cats:[
  {id:'moons', t:'Biggest moons in the Solar System', n:'By diameter.', items:[
    ['Ganymede','5,268 km'],['Titan','5,150 km'],['Callisto','4,821 km'],['Io','3,643 km'],
    ['The Moon','3,475 km','moon','luna','earths moon','our moon'],['Europa','3,122 km'],['Triton','2,707 km'],
    ['Titania','1,578 km'],['Rhea','1,527 km'],['Oberon','1,523 km']]},
  {id:'universe', t:'Most abundant elements in the universe', n:'By mass. Chemical symbols work too.', items:[
    ['Hydrogen','~74%','h'],['Helium','~24%','he'],['Oxygen','~1%','o'],['Carbon','0.5%','c'],['Neon','0.13%','ne'],
    ['Iron','0.11%','fe'],['Nitrogen','0.10%','n'],['Silicon','0.07%','si'],['Magnesium','0.06%','mg'],['Sulfur','0.05%','s','sulphur']]},
  {id:'crust', t:'Most abundant elements in Earth\'s crust', n:'By mass. Chemical symbols work too.', items:[
    ['Oxygen','46.1%','o'],['Silicon','28.2%','si'],['Aluminium','8.2%','al','aluminum'],['Iron','5.6%','fe'],
    ['Calcium','4.2%','ca'],['Sodium','2.4%','na'],['Magnesium','2.3%','mg'],['Potassium','2.1%','k'],
    ['Titanium','0.57%','ti'],['Hydrogen','0.14%','h']]},
  {id:'el1120', t:'Elements 11 to 20 of the periodic table', n:'In order of atomic number. Symbols work too.', items:[
    ['Sodium','No. 11','na'],['Magnesium','No. 12','mg'],['Aluminium','No. 13','al','aluminum'],['Silicon','No. 14','si'],
    ['Phosphorus','No. 15','p'],['Sulfur','No. 16','s','sulphur'],['Chlorine','No. 17','cl'],['Argon','No. 18','ar'],
    ['Potassium','No. 19','k'],['Calcium','No. 20','ca']]},
  {id:'small', t:'Smallest countries in the world', n:'By area, smallest first.', items:[
    ['Vatican City','0.44 km²','vatican','holy see'],['Monaco','2.0 km²'],['Nauru','21 km²'],['Tuvalu','26 km²'],
    ['San Marino','61 km²'],['Liechtenstein','160 km²'],['Marshall Islands','181 km²','marshall'],
    ['Saint Kitts and Nevis','261 km²','st kitts','st kitts and nevis','saint kitts'],['Maldives','298 km²'],['Malta','316 km²']]},
  {id:'dense', t:'Densest chemical elements', n:'Measured densities; superheavy synthetic elements excluded.', items:[
    ['Osmium','22.59 g/cm³','os'],['Iridium','22.56 g/cm³','ir'],['Platinum','21.45 g/cm³','pt'],['Rhenium','21.02 g/cm³','re'],
    ['Neptunium','20.45 g/cm³','np'],['Plutonium','19.82 g/cm³','pu'],['Gold','19.30 g/cm³','au'],['Tungsten','19.25 g/cm³','w','wolfram'],
    ['Uranium','19.1 g/cm³','u'],['Tantalum','16.69 g/cm³','ta']]},
  {id:'stars', t:'Brightest stars in the night sky', n:'Apparent magnitude (lower is brighter); the Sun excluded.', items:[
    ['Sirius','−1.46','dog star'],['Canopus','−0.74'],['Alpha Centauri','−0.27','rigil kentaurus','rigil kent'],
    ['Arcturus','−0.05'],['Vega','0.03'],['Capella','0.08'],['Rigel','0.13'],['Procyon','0.34'],
    ['Achernar','0.46'],['Betelgeuse','~0.5','betelgeuze']]},
  {id:'solar', t:'Largest objects in the Solar System', n:'By diameter.', items:[
    ['The Sun','1.39m km','sun'],['Jupiter','139,820 km'],['Saturn','116,460 km'],['Uranus','50,724 km'],
    ['Neptune','49,244 km'],['Earth','12,742 km'],['Venus','12,104 km'],['Mars','6,779 km'],
    ['Ganymede','5,268 km'],['Titan','5,150 km']]},
  {id:'reigns', t:'Longest-reigning English & British monarchs', n:'Since 1066. Use numbers: Henry 8 or Henry VIII.', exact:true, items:[
    ['Elizabeth II','70 yrs','elizabeth 2','elizabeth the second','queen elizabeth'],['Victoria','63 yrs','queen victoria'],
    ['George III','59 yrs','george 3','george the third'],['Henry III','56 yrs','henry 3','henry the third'],
    ['Edward III','50 yrs','edward 3','edward the third'],['Elizabeth I','44 yrs','elizabeth 1','elizabeth the first'],
    ['Henry VI','~39 yrs','henry 6','henry the sixth'],['Henry VIII','37 yrs','henry 8','henry the eighth'],
    ['Edward I','34 yrs 7 mo','edward 1','edward the first','longshanks'],['Henry II','34 yrs 6 mo','henry 2','henry the second']]},
  {id:'greek', t:'The first ten letters of the Greek alphabet', n:'In order.', items:[
    ['Alpha','Α α'],['Beta','Β β'],['Gamma','Γ γ'],['Delta','Δ δ'],['Epsilon','Ε ε'],['Zeta','Ζ ζ'],
    ['Eta','Η η'],['Theta','Θ θ'],['Iota','Ι ι'],['Kappa','Κ κ']]}
]},
{id:'pop', name:'Film, TV & pop culture', cats:[
  {id:'mcu', t:'The first ten Marvel Cinematic Universe films', n:'In release order, 2008–14.', items:[
    ['Iron Man','2008'],['The Incredible Hulk','2008','incredible hulk','hulk'],['Iron Man 2','2010'],['Thor','2011'],
    ['Captain America: The First Avenger','2011','captain america','first avenger','the first avenger'],
    ['The Avengers','2012','avengers','avengers assemble'],['Iron Man 3','2013'],
    ['Thor: The Dark World','2013','dark world','thor 2','thor the dark world'],
    ['Captain America: The Winter Soldier','2014','winter soldier','captain america 2','the winter soldier'],
    ['Guardians of the Galaxy','2014','guardians']]},
  {id:'bond', t:'The first ten James Bond films', n:'Official Eon films, in release order.', items:[
    ['Dr. No','1962','doctor no'],['From Russia with Love','1963'],['Goldfinger','1964'],['Thunderball','1965'],
    ['You Only Live Twice','1967'],['On Her Majesty\'s Secret Service','1969','ohmss'],['Diamonds Are Forever','1971'],
    ['Live and Let Die','1973'],['The Man with the Golden Gun','1974','man with the golden gun','golden gun'],
    ['The Spy Who Loved Me','1977','spy who loved me']]},
  {id:'doctor', t:'The first ten Doctor Who actors', n:'The Doctors, in order.', people:true, items:[
    ['William Hartnell','1st Doctor'],['Patrick Troughton','2nd Doctor'],['Jon Pertwee','3rd Doctor'],
    ['Tom Baker','4th Doctor'],['Peter Davison','5th Doctor'],['Colin Baker','6th Doctor'],
    ['Sylvester McCoy','7th Doctor'],['Paul McGann','8th Doctor'],['Christopher Eccleston','9th Doctor'],
    ['David Tennant','10th Doctor']]},
  {id:'pixar', t:'The first ten Pixar films', n:'In release order.', items:[
    ['Toy Story','1995'],['A Bug\'s Life','1998','bugs life'],['Toy Story 2','1999'],['Monsters, Inc.','2001','monsters inc'],
    ['Finding Nemo','2003'],['The Incredibles','2004','incredibles'],['Cars','2006'],['Ratatouille','2007'],
    ['WALL-E','2008','walle'],['Up','2009']]},
  {id:'starwars', t:'The first ten Star Wars films', n:'Live-action cinema releases, in order.', items:[
    ['A New Hope','1977','star wars','new hope','episode iv','episode 4'],['The Empire Strikes Back','1980','empire strikes back','empire'],
    ['Return of the Jedi','1983'],['The Phantom Menace','1999','phantom menace'],['Attack of the Clones','2002'],
    ['Revenge of the Sith','2005'],['The Force Awakens','2015','force awakens'],['Rogue One','2016'],
    ['The Last Jedi','2017','last jedi'],['Solo','2018','solo a star wars story']]},
  {id:'disney', t:'The first ten Disney animated classics', n:'Walt Disney Animation, in release order. A tough one.', items:[
    ['Snow White and the Seven Dwarfs','1937','snow white'],['Pinocchio','1940'],['Fantasia','1940'],['Dumbo','1941'],
    ['Bambi','1942'],['Saludos Amigos','1942'],['The Three Caballeros','1944','three caballeros'],
    ['Make Mine Music','1946'],['Fun and Fancy Free','1947'],['Melody Time','1948']]},
  {id:'celeb', t:'The first ten I\'m a Celebrity winners', n:'In order, 2002–10.', people:true, items:[
    ['Tony Blackburn','2002'],['Phil Tufnell','2003'],['Kerry Katona','2004','kerry mcfadden'],['Joe Pasquale','2004'],
    ['Carol Thatcher','2005'],['Matt Willis','2006'],['Christopher Biggins','2007','biggins'],['Joe Swash','2008'],
    ['Gino D\'Acampo','2009','dacampo','gino'],['Stacey Solomon','2010']]},
  {id:'strictly', t:'The first ten Strictly Come Dancing winners', n:'Series 1–10 (with their professional partners).', people:true, items:[
    ['Natasha Kaplinsky','Series 1'],['Jill Halfpenny','Series 2'],['Darren Gough','Series 3'],['Mark Ramprakash','Series 4'],
    ['Alesha Dixon','Series 5'],['Tom Chambers','Series 6'],['Chris Hollins','Series 7'],['Kara Tointon','Series 8'],
    ['Harry Judd','Series 9'],['Louis Smith','Series 10']]},
  {id:'xfactor', t:'The first ten X Factor (UK) winners', n:'In order, 2004–13.', people:true, items:[
    ['Steve Brookstein','2004'],['Shayne Ward','2005'],['Leona Lewis','2006'],['Leon Jackson','2007'],
    ['Alexandra Burke','2008'],['Joe McElderry','2009'],['Matt Cardle','2010'],['Little Mix','2011'],
    ['James Arthur','2012'],['Sam Bailey','2013']]},
  {id:'pokemon', t:'The first ten Pokémon in the Pokédex', n:'National Pokédex #001–#010.', items:[
    ['Bulbasaur','#001'],['Ivysaur','#002'],['Venusaur','#003'],['Charmander','#004'],['Charmeleon','#005'],
    ['Charizard','#006'],['Squirtle','#007'],['Wartortle','#008'],['Blastoise','#009'],['Caterpie','#010']]}
]}
];
