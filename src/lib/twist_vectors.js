export let pTwistAmpHighCopy = {
    name: "pTwist Amp High Copy",
    url: "https://www.twistbioscience.com/products/genes/vectors?tab=catalog-vectors",
    description: `High Copy cloning vector with pMB1 origin of replication. Twist Forward and Reverse primers flank the insertion site for easy product amplification. M13 forward and reverse priming sites are present for insert sequencing. `,
    genbank: `
LOCUS       Exported                2221 bp ds-DNA     circular SYN 15-NOV-2017
DEFINITION  synthetic circular DNA.
ACCESSION   .
VERSION     .
KEYWORDS    .
SOURCE      synthetic DNA construct
  ORGANISM  synthetic DNA construct
REFERENCE   1  (bases 1 to 2221)
  AUTHORS   Twistbioscience
  TITLE     Direct Submission
  JOURNAL   Exported Nov 15, 2017 from SnapGene 4.1.0
            http://www.snapgene.com
FEATURES             Location/Qualifiers
     source          1..2221
                     /organism="synthetic DNA construct"
                     /mol_type="other DNA"
     misc_feature    1..21
                     /label=Uni_9 R
     primer_bind     complement(57..73)
                     /label=M13 rev
                     /note="common sequencing primer, one of multiple similar 
                     variants"
     rep_origin      complement(245..833)
                     /direction=LEFT
                     /label=ori
                     /note="high-copy-number ColE1/pMB1/pBR322/pUC origin of 
                     replication"
     protein_bind    complement(950..974)
                     /gene="mutant version of attB"
                     /label=attB1
                     /bound_moiety="BP Clonase(TM)"
                     /note="recombination site for the Gateway(R) BP reaction"
     CDS             complement(1074..1934)
                     /codon_start=1
                     /gene="bla"
                     /product="beta-lactamase"
                     /label=AmpR
                     /note="confers resistance to ampicillin, carbenicillin, and
                     related antibiotics"
                     /translation="MSIQHFRVALIPFFAAFCLPVFAHPETLVKVKDAEDQLGARVGYI
                     ELDLNSGKILESFRPEERFPMMSTFKVLLCGAVLSRIDAGQEQLGRRIHYSQNDLVEYS
                     PVTEKHLTDGMTVRELCSAAITMSDNTAANLLLTTIGGPKELTAFLHNMGDHVTRLDRW
                     EPELNEAIPNDERDTTMPVAMATTLRKLLTGELLTLASRQQLIDWMEADKVAGPLLRSA
                     LPAGWFIADKSGAGERGSRGIIAALGPDGKPSRIVVIYTTGSQATMDERNRQIAEIGAS
                     LIKHW"
     promoter        complement(1935..2039)
                     /gene="bla"
                     /label=AmpR promoter
     primer_bind     2153..2169
                     /label=M13 fwd
                     /note="common sequencing primer, one of multiple similar 
                     variants"
     misc_feature    2200..2221
                     /label=Uni_9 F
ORIGIN
        1 aggctaggtg gaggctcagt gatgataagt ctgcgatggt ggatgcatgt gtcatggtca
       61 tagctgtttc ctgtgtgaaa ttgttatccg ctcagagggc acaatcctat tccgcgctat
      121 ccgacaatct ccaagacatt aggtggagtt cagttcggcg tatggcatat gtcgctggaa
      181 agaacatgtg agcaaaaggc cagcaaaagg ccaggaaccg taaaaaggcc gcgttgctgg
      241 cgtttttcca taggctccgc ccccctgacg agcatcacaa aaatcgacgc tcaagtcaga
      301 ggtggcgaaa cccgacagga ctataaagat accaggcgtt tccccctgga agctccctcg
      361 tgcgctctcc tgttccgacc ctgccgctta ccggatacct gtccgccttt ctcccttcgg
      421 gaagcgtggc gctttctcat agctcacgct gtaggtatct cagttcggtg taggtcgttc
      481 gctccaagct gggctgtgtg cacgaacccc ccgttcagcc cgaccgctgc gccttatccg
      541 gtaactatcg tcttgagtcc aacccggtaa gacacgactt atcgccactg gcagcagcca
      601 ctggtaacag gattagcaga gcgaggtatg taggcggtgc tacagagttc ttgaagtggt
      661 ggcctaacta cggctacact agaagaacag tatttggtat ctgcgctctg ctgaagccag
      721 ttaccttcgg aaaaagagtt ggtagctctt gatccggcaa acaaaccacc gctggtagcg
      781 gtggtttttt tgtttgcaag cagcagatta cgcgcagaaa aaaaggatct caagaagatc
      841 ctttgatctt ttctacgggg tctgacgctc tattcaacaa agccgccgtc ccgtcaagtc
      901 agcgtaaatg ggtagggggc ttcaaatcgt cctcgtgata ccaattcgga gcctgctttt
      961 ttgtacaaac ttgttgataa tggcaattca aggatcttca cctagatcct tttaaattaa
     1021 aaatgaagtt ttaaatcaat ctaaagtata tatgagtaaa cttggtctga cagttaccaa
     1081 tgcttaatca gtgaggcacc tatctcagcg atctgtctat ttcgttcatc catagttgcc
     1141 tgactccccg tcgtgtagat aactacgata cgggagggct taccatctgg ccccagtgct
     1201 gcaatgatac cgcgagagcc acgctcaccg gctccagatt tatcagcaat aaaccagcca
     1261 gccggaaggg ccgagcgcag aagtggtcct gcaactttat ccgcctccat ccagtctatt
     1321 aattgttgcc gggaagctag agtaagtagt tcgccagtta atagtttgcg caacgttgtt
     1381 gccattgcta caggcatcgt ggtgtcacgc tcgtcgtttg gtatggcttc attcagctcc
     1441 ggttcccaac gatcaaggcg agttacatga tcccccatgt tgtgcaaaaa agcggttagc
     1501 tccttcggtc ctccgatcgt tgtcagaagt aagttggccg cagtgttatc actcatggtt
     1561 atggcagcac tgcataattc tcttactgtc atgccatccg taagatgctt ttctgtgact
     1621 ggtgagtact caaccaagtc attctgagaa tagtgtatgc ggcgaccgag ttgctcttgc
     1681 ccggcgtcaa tacgggataa taccgcgcca catagcagaa ctttaaaagt gctcatcatt
     1741 ggaaaacgtt cttcggggcg aaaactctca aggatcttac cgctgttgag atccagttcg
     1801 atgtaaccca ctcgtgcacc caactgatct tcagcatctt ttactttcac cagcgtttct
     1861 gggtgagcaa aaacaggaag gcaaaatgcc gcaaaaaagg gaataagggc gacacggaaa
     1921 tgttgaatac tcatactctt cctttttcaa tattattgaa gcatttatca gggttattgt
     1981 ctcatgagcg gatacatatt tgaatgtatt tagaaaaata aacaaatagg ggttccgcgc
     2041 acatttcccc gaaaagtgcc agatacctga aacaaaaccc atcgtacggc caaggaagtc
     2101 tccaataact gtgatccacc acaagcgcca gggttttccc agtcacgacg ttgtaaaacg
     2161 acggccagtc atgcataatc cgcacgcatc tggaataagg aagtgccatt ccgcctgacc
     2221 t
//
`}

export let pTwistChlorHighCopy = {
    name: "pTwist Chlor High Copy",
    url: "https://www.twistbioscience.com/products/genes/vectors?tab=catalog-vectors",
    description: `High Copy cloning vector with pMB1 origin of replication. Twist Forward and Reverse primers flank the insertion site for easy product amplification. M13 forward and reverse priming sites are present for insert sequencing. `,
    genbank: `
LOCUS       Exported                2013 bp ds-DNA     circular SYN 26-FEB-2018
DEFINITION  synthetic circular DNA.
ACCESSION   .
VERSION     .
KEYWORDS    pTwist Chlor
SOURCE      synthetic DNA construct
  ORGANISM  synthetic DNA construct
REFERENCE   1  (bases 1 to 2013)
  AUTHORS   Twistbioscience
  TITLE     Direct Submission
  JOURNAL   Exported Feb 26, 2018 from SnapGene 4.1.0
            http://www.snapgene.com
FEATURES             Location/Qualifiers
     source          1..2013
                     /organism="synthetic DNA construct"
                     /mol_type="other DNA"
     misc_feature    1..21
                     /label=Uni_9 R
     primer_bind     complement(57..73)
                     /label=M13 rev
                     /note="common sequencing primer, one of multiple similar 
                     variants"
     rep_origin      complement(245..833)
                     /direction=LEFT
                     /label=ori
                     /note="high-copy-number ColE1/pMB1/pBR322/pUC origin of 
                     replication"
     terminator      966..1060
                     /label=lambda t0 terminator
                     /note="transcription terminator from phage lambda"
     CDS             complement(1081..1740)
                     /codon_start=1
                     /gene="cat"
                     /product="chloramphenicol acetyltransferase"
                     /label=CmR
                     /note="confers resistance to chloramphenicol"
                     /translation="MEKKITGYTTVDISQWHRKEHFEAFQSVAQCTYNQTVQLDITAFL
                     KTVKKNKHKFYPAFIHILARLMNAHPEFRMAMKDGELVIWDSVHPCYTVFHEQTETFSS
                     LWSEYHDDFRQFLHIYSQDVACYGENLAYFPKGFIENMFFVSANPWVSFTSFDLNVANM
                     DNFFAPVFTMGKYYTQGDKVLMPLAIQVHHAVCDGFHVGRMLNELQQYCDEWQGGA"
     promoter        complement(1741..1843)
                     /label=cat promoter
                     /note="promoter of the E. coli cat gene encoding 
                     chloramphenicol acetyltransferase"
     primer_bind     1945..1961
                     /label=M13 fwd
                     /note="common sequencing primer, one of multiple similar 
                     variants"
     misc_feature    1992..2013
                     /label=Uni_9 F
ORIGIN
        1 aggctaggtg gaggctcagt gatgataagt ctgcgatggt ggatgcatgt gtcatggtca
       61 tagctgtttc ctgtgtgaaa ttgttatccg ctcagagggc acaatcctat tccgcgctat
      121 ccgacaatct ccaagacatt aggtggagtt cagttcggcg tatggcatat gtcgctggaa
      181 agaacatgtg agcaaaaggc cagcaaaagg ccaggaaccg taaaaaggcc gcgttgctgg
      241 cgtttttcca taggctccgc ccccctgacg agcatcacaa aaatcgacgc tcaagtcaga
      301 ggtggcgaaa cccgacagga ctataaagat accaggcgtt tccccctgga agctccctcg
      361 tgcgctctcc tgttccgacc ctgccgctta ccggatacct gtccgccttt ctcccttcgg
      421 gaagcgtggc gctttctcat agctcacgct gtaggtatct cagttcggtg taggtcgttc
      481 gctccaagct gggctgtgtg cacgaacccc ccgttcagcc cgaccgctgc gccttatccg
      541 gtaactatcg tcttgagtcc aacccggtaa gacacgactt atcgccactg gcagcagcca
      601 ctggtaacag gattagcaga gcgaggtatg taggcggtgc tacagagttc ttgaagtggt
      661 ggcctaacta cggctacact agaagaacag tatttggtat ctgcgctctg ctgaagccag
      721 ttaccttcgg aaaaagagtt ggtagctctt gatccggcaa acaaaccacc gctggtagcg
      781 gtggtttttt tgtttgcaag cagcagatta cgcgcagaaa aaaaggatct caagaagatc
      841 ctttgatctt ttctacgggg tctgacgctc tattcaacaa agccgccgtc ccgtcaagtc
      901 agcgtaaatg ggtagggggc ttcaaatcgt ccccccatac gatataagtt gttactagtg
      961 cttggattct caccaataaa aaacgcccgg cggcaaccga gcgttctgaa caaatccaga
     1021 tggagttctg aggtcattac tggatctatc aacaggagtc caagcgagct cgatatcaaa
     1081 ttacgccccg ccctgccact catcgcagta ctgttgtaat tcattaagca ttctgccgac
     1141 atggaagcca tcacaaacgg catgatgaac ctgaatcgcc agcggcatca gcaccttgtc
     1201 gccttgcgta taatatttgc ccatggtgaa aacgggggcg aagaagttgt ccatattggc
     1261 cacgtttaaa tcaaaactgg tgaaactcac ccagggattg gctgagacga aaaacatatt
     1321 ctcaataaac cctttaggga aataggccag gttttcaccg taacacgcca catcttgcga
     1381 atatatgtgt agaaactgcc ggaaatcgtc gtggtattca ctccagagcg atgaaaacgt
     1441 ttcagtttgc tcatggaaaa cggtgtaaca agggtgaaca ctatcccata tcaccagctc
     1501 accgtctttc attgccatac gaaattccgg atgagcattc atcaggcggg caagaatgtg
     1561 aataaaggcc ggataaaact tgtgcttatt tttctttacg gtctttaaaa aggccgtaat
     1621 atccagctga acggtctggt tataggtaca ttgagcaact gactgaaatg cctcaaaatg
     1681 ttctttacga tgccattggg atatatcaac ggtggtatat ccagtgattt ttttctccat
     1741 tttagcttcc ttagctcctg aaaatctcga taactcaaaa aatacgcccg gtagtgatct
     1801 tatttcatta tggtgaaagt tggaacctct tacgtgccga tcaacgtctc attgatacct
     1861 gaaacaaaac ccatcgtacg gccaaggaag tctccaataa ctgtgatcca ccacaagcgc
     1921 cagggttttc ccagtcacga cgttgtaaaa cgacggccag tcatgcataa tccgcacgca
     1981 tctggaataa ggaagtgcca ttccgcctga cct
//
`
}

export let pTwistKanHighCopy = {
    name: "pTwist Kan High Copy",
    url: "https://www.twistbioscience.com/products/genes/vectors?tab=catalog-vectors",
    description: `High Copy cloning vector with pMB1 origin of replication and Kanamycin resistance marker. Twist Forward and Reverse primers flank the insertion site for easy product amplification. M13 forward and reverse priming sites are present for insert sequencing.`,
    genbank: `
LOCUS       pTwist_Kan_HC_v2        2255 bp DNA     circular SYN 25-JUN-2024
DEFINITION  synthetic circular DNA
ACCESSION   .
VERSION     .
KEYWORDS    .
SOURCE      synthetic DNA construct
  ORGANISM  synthetic DNA construct
REFERENCE   1  (bases 1 to 2255)
  AUTHORS   siwong
  TITLE     Direct Submission
  JOURNAL   Exported Jun 25, 2024 from SnapGene 7.2.1
            https://www.snapgene.com
FEATURES             Location/Qualifiers
     source          1..2255
                     /mol_type="other DNA"
                     /organism="synthetic DNA construct"
     rep_origin      complement(87..675)
                     /direction=LEFT
                     /label=ori
                     /note="high-copy-number ColE1/pMB1/pBR322/pUC origin of 
                     replication"
     CDS             complement(856..1665)
                     /codon_start=1
                     /gene="aph(3')-Ia"
                     /product="aminoglycoside phosphotransferase"
                     /label=KanR
                     /note="confers resistance to kanamycin"
                     /translation="MSHIQRETSRPRLNSNMDADLYGYKWARDNVGQSGATIYRLYGKP
                     DAPELFLKHGKGSVANDVTDEMVRLNWLTEFMPLPTIKHFIRTPDDAWLLTTAIPGKTA
                     FQVLEEYPDSGENIVDALAVFLRRLHSIPVCNCPFNSDRVFRLAQAQSRMNNGLVDASD
                     FDDERNGWPVEQVWKEMHKLLPFSPDSVVTHGDFSLDNLIFDEGKLIGCIDVGRVGIAD
                     RYQDLAILWNCLGEFSPSLQKRLFQKYGIDNPDMNKLQFHLMLDEFF"
     primer_bind     2029..2045
                     /label=M13 fwd
                     /note="common sequencing primer, one of multiple similar 
                     variants"
     primer_bind     2076..2097
                     /label=Uni_9 F
     misc_feature    2097^2098
                     /label=Your gene here
     primer_bind     complement(2098..2118)
                     /label=Uni_9 R
     primer_bind     complement(2154..2170)
                     /label=M13 rev
                     /note="common sequencing primer, one of multiple similar 
                     variants"
ORIGIN
        1 cgtatggcat atgtcgctgg aaagaacatg tgagcaaaag gccagcaaaa ggccaggaac
       61 cgtaaaaagg ccgcgttgct ggcgtttttc cataggctcc gcccccctga cgagcatcac
      121 aaaaatcgac gctcaagtca gaggtggcga aacccgacag gactataaag ataccaggcg
      181 tttccccctg gaagctccct cgtgcgctct cctgttccga ccctgccgct taccggatac
      241 ctgtccgcct ttctcccttc gggaagcgtg gcgctttctc atagctcacg ctgtaggtat
      301 ctcagttcgg tgtaggtcgt tcgctccaag ctgggctgtg tgcacgaacc ccccgttcag
      361 cccgaccgct gcgccttatc cggtaactat cgtcttgagt ccaacccggt aagacacgac
      421 ttatcgccac tggcagcagc cactggtaac aggattagca gagcgaggta tgtaggcggt
      481 gctacagagt tcttgaagtg gtggcctaac tacggctaca ctagaagaac agtatttggt
      541 atctgcgctc tgctgaagcc agttaccttc ggaaaaagag ttggtagctc ttgatccggc
      601 aaacaaacca ccgctggtag cggtggtttt tttgtttgca agcagcagat tacgcgcaga
      661 aaaaaaggat ctcaagaaga agatcctttg atcttttcta cggggtctga cgctcagtgg
      721 aacgaaaact cacgttaagg gattttggtc atgagattat caaaaaggat cttcacctag
      781 atccttttaa attaaaaatg aagttttaaa tcaagcccaa tctgaataat gttacaacca
      841 attaaccaat tctgattaga aaaactcatc gagcatcaaa tgaaactgca atttattcat
      901 atcaggatta tcaataccat atttttgaaa aagccgtttc tgtaatgaag gagaaaactc
      961 accgaggcag ttccatagga tggcaagatc ctggtatcgg tctgcgattc cgactcgtcc
     1021 aacatcaata caacctatta atttcccctc gtcaaaaata aggttatcaa gtgagaaatc
     1081 accatgagtg acgactgaat ccggtgagaa tggcaaaagt ttatgcattt ctttccagac
     1141 ttgttcaaca ggccagccat tacgctcgtc atcaaaatca ctcgcatcaa ccaaaccgtt
     1201 attcattcgt gattgcgcct gagcaagacg aaatacgcga tcgctgttaa aaggacaatt
     1261 acaaacagga atcgaatgca accggcgcag gaacactgcc agcgcatcaa caatattttc
     1321 acctgaatca ggatattctt ctaatacctg gaatgctgtt tttccgggga tcgcagtggt
     1381 gagtaaccat gcatcatcag gagtacggat aaaatgcttg atggtcggaa gaggcataaa
     1441 ttccgtcagc cagtttagtc tgaccatctc atctgtaaca tcattggcaa cgctaccttt
     1501 gccatgtttc agaaacaact ctggcgcatc gggcttccca tacaagcgat agattgtcgc
     1561 acctgattgc ccgacattat cgcgagccca tttataccca tataaatcag catccatgtt
     1621 ggaatttaat cgcggcctcg acgtttcccg ttgaatatgg ctcataacac cccttgtatt
     1681 actgtttatg taagcagaca gttttattgt tcatgatgat atatttttat cttgtgcaat
     1741 gtaacatcag agattttgag acacgggcca gagctgcatc gcgcgtttcg gtgatgacgg
     1801 tgaaaacctc tgacacatgc agctcccggg acggtcacag cttgtctgta agcggatgcc
     1861 gggagcagac aagcccgtca gggcgcgtca gcgggtgttg gctgttgttt gtcgcattat
     1921 acgagcgtcc aggttgggat acctgaaaca aaacccatcg tacggccaag gaagtctcca
     1981 ataactgtga tccaccacaa gcgccagggt tttcccagtc acgacgttgt aaaacgacgg
     2041 ccagtcatgc ataatccgca cgcatctgga ataaggaagt gccattccgc ctgacctagg
     2101 ctaggtggag gctcagtgat gataagtctg cgatggtgga tgcatgtgtc atggtcatag
     2161 ctgtttcctg tgtgaaattg ttatccgctc agagggcaca atcctattcc gcgctatccg
     2221 acaatctcca agacattagg tggagttcag ttcgg
//
`
}

export let puc19 = {
    name: "puc19",
    url: "https://www.twistbioscience.com/products/genes/vectors?tab=catalog-vectors",
    description: `Commonly used high-copy cloning vector with Ampicillin resistance developed by Joachim Messing, et al. in University of California. It contains the LacZ gene and multiple cloning sites. Insertion sites: HindIII_SphI - LacZ is inactivated. The insertion site is flanked by HindIII and SphI, which allows restrcition enzyme digestion to separate the insert from the backbone. HindIII_XbaI - LacZ is inactivated. The insertion site is flanked by HindIII and XbaI, which allows restrcition enzyme digestion to separate the insert from the backbone.`,
    genbank: `
LOCUS       pUC19        2686 bp DNA     circular SYN 22-OCT-2024
DEFINITION  synthetic circular DNA
ACCESSION   .
VERSION     .
KEYWORDS    .
SOURCE      synthetic DNA construct
  ORGANISM  synthetic DNA construct
REFERENCE   1  (bases 1 to 2686)
  AUTHORS   siwong
  TITLE     Direct Submission
  JOURNAL   Exported Oct 28, 2024 from SnapGene 7.2.1
            https://www.snapgene.com
FEATURES             Location/Qualifiers
     source          1..2686
                     /mol_type="other DNA"
                     /organism="synthetic DNA construct"
     protein_bind    1..22
                     /label=CAP binding site
                     /bound_moiety="E. coli catabolite activator protein"
                     /note="CAP binding activates transcription in the presence 
                     of cAMP."
     promoter        join(37..42,43..60,61..67)
                     /label=lac promoter
                     /note="promoter for the E. coli lac operon"
     protein_bind    75..91
                     /label=lac operator
                     /bound_moiety="lac repressor encoded by lacI"
                     /note="The lac repressor binds to the lac operator to 
                     inhibit transcription in E. coli. This inhibition can be 
                     relieved by adding lactose or 
                     isopropyl-beta-D-thiogalactopyranoside (IPTG)."
     primer_bind     99..115
                     /label=M13 rev
                     /note="common sequencing primer, one of multiple similar 
                     variants"
     CDS             111..434
                     /codon_start=1
                     /gene="lacZ fragment"
                     /product="LacZ-alpha fragment of beta-galactosidase"
                     /label=lacZ-alpha
                     /translation="MTMITPSLHACRSTLEDPRVPSSNSLAVVLQRRDWENPGVTQLNR
                     LAAHPPFASWRNSEEARTDRPSQQLRSLNGEWRLMRYFLLTHLCGISHRIWCTLSTICS
                     DAA"
     misc_feature    128..157
                     /label=MCS
                     /note="pUC18/19 multiple cloning site"
     primer_bind     complement(185..201)
                     /label=M13 fwd
                     /note="common sequencing primer, one of multiple similar 
                     variants"
     promoter        675..779
                     /gene="bla"
                     /label=AmpR promoter
     CDS             join(780..848,849..1640)
                     /codon_start=1
                     /gene="bla"
                     /product="beta-lactamase"
                     /label=AmpR
                     /note="confers resistance to ampicillin, carbenicillin, and
                     related antibiotics"
                     /translation="MSIQHFRVALIPFFAAFCLPVFAHPETLVKVKDAEDQLGARVGYI
                     ELDLNSGKILESFRPEERFPMMSTFKVLLCGAVLSRIDAGQEQLGRRIHYSQNDLVEYS
                     PVTEKHLTDGMTVRELCSAAITMSDNTAANLLLTTIGGPKELTAFLHNMGDHVTRLDRW
                     EPELNEAIPNDERDTTMPVAMATTLRKLLTGELLTLASRQQLIDWMEADKVAGPLLRSA
                     LPAGWFIADKSGAGERGSRGIIAALGPDGKPSRIVVIYTTGSQATMDERNRQIAEIGAS
                     LIKHW"
     rep_origin      1811..2399
                     /direction=RIGHT
                     /label=ori
                     /note="high-copy-number ColE1/pMB1/pBR322/pUC origin of 
                     replication"
ORIGIN
        1 taatgtgagt tagctcactc attaggcacc ccaggcttta cactttatgc ttccggctcg
       61 tatgttgtgt ggaattgtga gcggataaca atttcacaca ggaaacagct atgaccatga
      121 ttacgccaag cttgcatgcc tgcaggtcga ctctagagga tccccgggta ccgagctcga
      181 attcactggc cgtcgtttta caacgtcgtg actgggaaaa ccctggcgtt acccaactta
      241 atcgccttgc agcacatccc cctttcgcca gctggcgtaa tagcgaagag gcccgcaccg
      301 atcgcccttc ccaacagttg cgcagcctga atggcgaatg gcgcctgatg cggtattttc
      361 tccttacgca tctgtgcggt atttcacacc gcatatggtg cactctcagt acaatctgct
      421 ctgatgccgc atagttaagc cagccccgac acccgccaac acccgctgac gcgccctgac
      481 gggcttgtct gctcccggca tccgcttaca gacaagctgt gaccgtctcc gggagctgca
      541 tgtgtcagag gttttcaccg tcatcaccga aacgcgcgag acgaaagggc ctcgtgatac
      601 gcctattttt ataggttaat gtcatgataa taatggtttc ttagacgtca ggtggcactt
      661 ttcggggaaa tgtgcgcgga acccctattt gtttattttt ctaaatacat tcaaatatgt
      721 atccgctcat gagacaataa ccctgataaa tgcttcaata atattgaaaa aggaagagta
      781 tgagtattca acatttccgt gtcgccctta ttcccttttt tgcggcattt tgccttcctg
      841 tttttgctca cccagaaacg ctggtgaaag taaaagatgc tgaagatcag ttgggtgcac
      901 gagtgggtta catcgaactg gatctcaaca gcggtaagat ccttgagagt tttcgccccg
      961 aagaacgttt tccaatgatg agcactttta aagttctgct atgtggcgcg gtattatccc
     1021 gtattgacgc cgggcaagag caactcggtc gccgcataca ctattctcag aatgacttgg
     1081 ttgagtactc accagtcaca gaaaagcatc ttacggatgg catgacagta agagaattat
     1141 gcagtgctgc cataaccatg agtgataaca ctgcggccaa cttacttctg acaacgatcg
     1201 gaggaccgaa ggagctaacc gcttttttgc acaacatggg ggatcatgta actcgccttg
     1261 atcgttggga accggagctg aatgaagcca taccaaacga cgagcgtgac accacgatgc
     1321 ctgtagcaat ggcaacaacg ttgcgcaaac tattaactgg cgaactactt actctagctt
     1381 cccggcaaca attaatagac tggatggagg cggataaagt tgcaggacca cttctgcgct
     1441 cggcccttcc ggctggctgg tttattgctg ataaatctgg agccggtgag cgtgggtctc
     1501 gcggtatcat tgcagcactg gggccagatg gtaagccctc ccgtatcgta gttatctaca
     1561 cgacggggag tcaggcaact atggatgaac gaaatagaca gatcgctgag ataggtgcct
     1621 cactgattaa gcattggtaa ctgtcagacc aagtttactc atatatactt tagattgatt
     1681 taaaacttca tttttaattt aaaaggatct aggtgaagat cctttttgat aatctcatga
     1741 ccaaaatccc ttaacgtgag ttttcgttcc actgagcgtc agaccccgta gaaaagatca
     1801 aaggatcttc ttgagatcct ttttttctgc gcgtaatctg ctgcttgcaa acaaaaaaac
     1861 caccgctacc agcggtggtt tgtttgccgg atcaagagct accaactctt tttccgaagg
     1921 taactggctt cagcagagcg cagataccaa atactgttct tctagtgtag ccgtagttag
     1981 gccaccactt caagaactct gtagcaccgc ctacatacct cgctctgcta atcctgttac
     2041 cagtggctgc tgccagtggc gataagtcgt gtcttaccgg gttggactca agacgatagt
     2101 taccggataa ggcgcagcgg tcgggctgaa cggggggttc gtgcacacag cccagcttgg
     2161 agcgaacgac ctacaccgaa ctgagatacc tacagcgtga gctatgagaa agcgccacgc
     2221 ttcccgaagg gagaaaggcg gacaggtatc cggtaagcgg cagggtcgga acaggagagc
     2281 gcacgaggga gcttccaggg ggaaacgcct ggtatcttta tagtcctgtc gggtttcgcc
     2341 acctctgact tgagcgtcga tttttgtgat gctcgtcagg ggggcggagc ctatggaaaa
     2401 acgccagcaa cgcggccttt ttacggttcc tggccttttg ctggcctttt gctcacatgt
     2461 tctttcctgc gttatcccct gattctgtgg ataaccgtat taccgccttt gagtgagctg
     2521 ataccgctcg ccgcagccga acgaccgagc gcagcgagtc agtgagcgag gaagcggaag
     2581 agcgcccaat acgcaaaccg cctctccccg cgcgttggcc gattcattaa tgcagctggc
     2641 acgacaggtt tcccgactgg aaagcgggca gtgagcgcaa cgcaat
//
`}