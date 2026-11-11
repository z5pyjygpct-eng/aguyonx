/**
 * Slim district-number lookup extracted from the official 2026 LIS-based
 * member rosters (src/lib/ga-members-2026-house.json and
 * src/lib/ga-members-2026-senate.json, roster date 2026-11-09).
 * District numbers only. Those source files do not include district names
 * or localities, so name/locality search is not offered.
 */
export type GaMemberDistrict = {
  lisId: string;
  chamber: "house" | "senate";
  district: number;
  name: string;
};

export const GA_MEMBER_DISTRICTS: GaMemberDistrict[] = [
  {
    "lisId": "H0219",
    "chamber": "house",
    "district": 1,
    "name": "Patrick A. Hope"
  },
  {
    "lisId": "H0375",
    "chamber": "house",
    "district": 2,
    "name": "Adele Y. McClure"
  },
  {
    "lisId": "H0239",
    "chamber": "house",
    "district": 3,
    "name": "Alfonso H. Lopez"
  },
  {
    "lisId": "H0208",
    "chamber": "house",
    "district": 4,
    "name": "Charniele L. Herring"
  },
  {
    "lisId": "H0406",
    "chamber": "house",
    "district": 5,
    "name": "Kirk McPike"
  },
  {
    "lisId": "H0269",
    "chamber": "house",
    "district": 6,
    "name": "Richard C. \"Rip\" Sullivan, Jr."
  },
  {
    "lisId": "H0370",
    "chamber": "house",
    "district": 7,
    "name": "Karen Keys-Gamarra"
  },
  {
    "lisId": "H0344",
    "chamber": "house",
    "district": 8,
    "name": "Irene Shin"
  },
  {
    "lisId": "H0294",
    "chamber": "house",
    "district": 9,
    "name": "Karrie K. Delaney"
  },
  {
    "lisId": "H0317",
    "chamber": "house",
    "district": 10,
    "name": "Dan I. Helmer"
  },
  {
    "lisId": "H0403",
    "chamber": "house",
    "district": 11,
    "name": "Gretchen M. Bulova"
  },
  {
    "lisId": "H0351",
    "chamber": "house",
    "district": 12,
    "name": "Holly M. Seibold"
  },
  {
    "lisId": "H0264",
    "chamber": "house",
    "district": 13,
    "name": "Marcus B. Simon"
  },
  {
    "lisId": "H0108",
    "chamber": "house",
    "district": 14,
    "name": "Vivian E. Watts"
  },
  {
    "lisId": "H0355",
    "chamber": "house",
    "district": 15,
    "name": "Laura Jane Cohen"
  },
  {
    "lisId": "H0281",
    "chamber": "house",
    "district": 16,
    "name": "Paul E. Krizek"
  },
  {
    "lisId": "H0405",
    "chamber": "house",
    "district": 17,
    "name": "Garrett McGuire"
  },
  {
    "lisId": "H0305",
    "chamber": "house",
    "district": 18,
    "name": "Kathy K.L. Tran"
  },
  {
    "lisId": "H0365",
    "chamber": "house",
    "district": 19,
    "name": "Rozia A. Henson, Jr."
  },
  {
    "lisId": "H0382",
    "chamber": "house",
    "district": 21,
    "name": "Joshua E. Thomas"
  },
  {
    "lisId": "H0297",
    "chamber": "house",
    "district": 22,
    "name": "Elizabeth R. Guzman"
  },
  {
    "lisId": "H0404",
    "chamber": "house",
    "district": 23,
    "name": "Margaret A. Franklin"
  },
  {
    "lisId": "H0227",
    "chamber": "house",
    "district": 24,
    "name": "Luke E. Torian"
  },
  {
    "lisId": "H0343",
    "chamber": "house",
    "district": 25,
    "name": "Briana D. Sewell"
  },
  {
    "lisId": "H0385",
    "chamber": "house",
    "district": 26,
    "name": "JJ Singh"
  },
  {
    "lisId": "H0380",
    "chamber": "house",
    "district": 27,
    "name": "Atoosa R. Reaser"
  },
  {
    "lisId": "H0301",
    "chamber": "house",
    "district": 28,
    "name": "David A. Reid"
  },
  {
    "lisId": "H0374",
    "chamber": "house",
    "district": 29,
    "name": "Marty Martinez"
  },
  {
    "lisId": "H0395",
    "chamber": "house",
    "district": 30,
    "name": "John Chilton McAuliff"
  },
  {
    "lisId": "H0377",
    "chamber": "house",
    "district": 31,
    "name": "Delores Oates"
  },
  {
    "lisId": "H0329",
    "chamber": "house",
    "district": 32,
    "name": "Bill Wiley"
  },
  {
    "lisId": "H0398",
    "chamber": "house",
    "district": 33,
    "name": "Justin Pence"
  },
  {
    "lisId": "H0231",
    "chamber": "house",
    "district": 34,
    "name": "Tony O. Wilt"
  },
  {
    "lisId": "H0321",
    "chamber": "house",
    "district": 35,
    "name": "Chris S. Runion"
  },
  {
    "lisId": "H0350",
    "chamber": "house",
    "district": 36,
    "name": "Ellen H. McLaughlin"
  },
  {
    "lisId": "H0253",
    "chamber": "house",
    "district": 37,
    "name": "Terry L. Austin"
  },
  {
    "lisId": "H0266",
    "chamber": "house",
    "district": 38,
    "name": "Sam Rasoul"
  },
  {
    "lisId": "H0357",
    "chamber": "house",
    "district": 39,
    "name": "Will Davis"
  },
  {
    "lisId": "H0308",
    "chamber": "house",
    "district": 40,
    "name": "Joseph P. McNamara"
  },
  {
    "lisId": "H0393",
    "chamber": "house",
    "district": 41,
    "name": "Lily V. Franklin"
  },
  {
    "lisId": "H0333",
    "chamber": "house",
    "district": 42,
    "name": "Jason S. Ballard"
  },
  {
    "lisId": "H0224",
    "chamber": "house",
    "district": 43,
    "name": "James W. Morefield"
  },
  {
    "lisId": "H0242",
    "chamber": "house",
    "district": 44,
    "name": "Israel D. O'Quinn"
  },
  {
    "lisId": "H0056",
    "chamber": "house",
    "district": 45,
    "name": "Terry G. Kilgore"
  },
  {
    "lisId": "H0390",
    "chamber": "house",
    "district": 46,
    "name": "Mitchell Cornett"
  },
  {
    "lisId": "H0348",
    "chamber": "house",
    "district": 47,
    "name": "Wren M. Williams"
  },
  {
    "lisId": "H0384",
    "chamber": "house",
    "district": 48,
    "name": "Eric Phillips"
  },
  {
    "lisId": "H0401",
    "chamber": "house",
    "district": 49,
    "name": "Madison Whittle"
  },
  {
    "lisId": "H0136",
    "chamber": "house",
    "district": 50,
    "name": "Thomas C. Wright, Jr."
  },
  {
    "lisId": "H0383",
    "chamber": "house",
    "district": 51,
    "name": "Eric R. Zehr"
  },
  {
    "lisId": "H0325",
    "chamber": "house",
    "district": 52,
    "name": "Wendell S. Walker"
  },
  {
    "lisId": "H0364",
    "chamber": "house",
    "district": 53,
    "name": "Timothy P. Griffin"
  },
  {
    "lisId": "H0354",
    "chamber": "house",
    "district": 54,
    "name": "Katrina Callsen"
  },
  {
    "lisId": "H0371",
    "chamber": "house",
    "district": 55,
    "name": "Amy J. Laufer"
  },
  {
    "lisId": "H0362",
    "chamber": "house",
    "district": 56,
    "name": "Thomas A. Garrett, Jr."
  },
  {
    "lisId": "H0397",
    "chamber": "house",
    "district": 57,
    "name": "May Nivar"
  },
  {
    "lisId": "H0327",
    "chamber": "house",
    "district": 58,
    "name": "Rodney T. Willett"
  },
  {
    "lisId": "H0259",
    "chamber": "house",
    "district": 59,
    "name": "Hyland F. \"Buddy\" Fowler, Jr."
  },
  {
    "lisId": "H0328",
    "chamber": "house",
    "district": 60,
    "name": "Scott A. Wyatt"
  },
  {
    "lisId": "H0247",
    "chamber": "house",
    "district": 61,
    "name": "Michael J. Webert"
  },
  {
    "lisId": "H0394",
    "chamber": "house",
    "district": 62,
    "name": "Karen Hamilton"
  },
  {
    "lisId": "H0342",
    "chamber": "house",
    "district": 63,
    "name": "Phillip A. Scott"
  },
  {
    "lisId": "H0388",
    "chamber": "house",
    "district": 64,
    "name": "Stacey Annie Carroll"
  },
  {
    "lisId": "H0314",
    "chamber": "house",
    "district": 65,
    "name": "Joshua G. Cole"
  },
  {
    "lisId": "H0389",
    "chamber": "house",
    "district": 66,
    "name": "Nicole Cole"
  },
  {
    "lisId": "H0369",
    "chamber": "house",
    "district": 67,
    "name": "Hillary Pugh Kent"
  },
  {
    "lisId": "H0238",
    "chamber": "house",
    "district": 68,
    "name": "M. Keith Hodges"
  },
  {
    "lisId": "H0392",
    "chamber": "house",
    "district": 69,
    "name": "Mark C. Downey"
  },
  {
    "lisId": "H0323",
    "chamber": "house",
    "district": 70,
    "name": "Shelly A. Simonds"
  },
  {
    "lisId": "H0386",
    "chamber": "house",
    "district": 71,
    "name": "Jessica L. Anderson"
  },
  {
    "lisId": "H0124",
    "chamber": "house",
    "district": 72,
    "name": "R. Lee Ware"
  },
  {
    "lisId": "H0396",
    "chamber": "house",
    "district": 73,
    "name": "Leslie Chambers Mehta"
  },
  {
    "lisId": "H0335",
    "chamber": "house",
    "district": 74,
    "name": "Mike A. Cherry"
  },
  {
    "lisId": "H0391",
    "chamber": "house",
    "district": 75,
    "name": "Lindsey Dougherty"
  },
  {
    "lisId": "H0361",
    "chamber": "house",
    "district": 76,
    "name": "Debra D. Gardner"
  },
  {
    "lisId": "H0402",
    "chamber": "house",
    "district": 77,
    "name": "Charlie Schmidt"
  },
  {
    "lisId": "H0212",
    "chamber": "house",
    "district": 78,
    "name": "Betsy B. Carr"
  },
  {
    "lisId": "H0356",
    "chamber": "house",
    "district": 79,
    "name": "Rae Cousins"
  },
  {
    "lisId": "H0372",
    "chamber": "house",
    "district": 80,
    "name": "Destiny LeVere Bolling"
  },
  {
    "lisId": "H0207",
    "chamber": "house",
    "district": 81,
    "name": "Delores L. McQuinn"
  },
  {
    "lisId": "H0399",
    "chamber": "house",
    "district": 82,
    "name": "Kimberly Pope Adams"
  },
  {
    "lisId": "H0347",
    "chamber": "house",
    "district": 83,
    "name": "H. Otto Wachsmann, Jr."
  },
  {
    "lisId": "H0336",
    "chamber": "house",
    "district": 84,
    "name": "Nadarius E. Clark"
  },
  {
    "lisId": "H0284",
    "chamber": "house",
    "district": 85,
    "name": "Marcia S. \"Cia\" Price"
  },
  {
    "lisId": "H0400",
    "chamber": "house",
    "district": 86,
    "name": "Virgil Thornton"
  },
  {
    "lisId": "H0173",
    "chamber": "house",
    "district": 87,
    "name": "Jeion A. Ward"
  },
  {
    "lisId": "H0322",
    "chamber": "house",
    "district": 88,
    "name": "Don Scott"
  },
  {
    "lisId": "H0387",
    "chamber": "house",
    "district": 89,
    "name": "Karen R. \"Kacey\" Carnegie"
  },
  {
    "lisId": "H0262",
    "chamber": "house",
    "district": 90,
    "name": "James A. \"Jay\" Leftwich"
  },
  {
    "lisId": "H0285",
    "chamber": "house",
    "district": 91,
    "name": "C.E. Cliff Hayes, Jr."
  },
  {
    "lisId": "H0353",
    "chamber": "house",
    "district": 92,
    "name": "Bonita G. Anthony"
  },
  {
    "lisId": "H0349",
    "chamber": "house",
    "district": 93,
    "name": "Jackie H. Glass"
  },
  {
    "lisId": "H0366",
    "chamber": "house",
    "district": 94,
    "name": "Phil M. Hernandez"
  },
  {
    "lisId": "H0311",
    "chamber": "house",
    "district": 95,
    "name": "Alex Q. Askew"
  },
  {
    "lisId": "H0295",
    "chamber": "house",
    "district": 96,
    "name": "Kelly K. Convirs-Fowler"
  },
  {
    "lisId": "H0360",
    "chamber": "house",
    "district": 97,
    "name": "Michael B. Feggans"
  },
  {
    "lisId": "H0407",
    "chamber": "house",
    "district": 98,
    "name": "Andrew Rice"
  },
  {
    "lisId": "H0345",
    "chamber": "house",
    "district": 99,
    "name": "Anne Ferrell Tata"
  },
  {
    "lisId": "H0267",
    "chamber": "house",
    "district": 100,
    "name": "Robert S. Bloxom, Jr."
  },
  {
    "lisId": "S0121",
    "chamber": "senate",
    "district": 1,
    "name": "Timmy French"
  },
  {
    "lisId": "S0068",
    "chamber": "senate",
    "district": 2,
    "name": "Mark D. Obenshain"
  },
  {
    "lisId": "S0122",
    "chamber": "senate",
    "district": 3,
    "name": "Christopher T. Head"
  },
  {
    "lisId": "S0101",
    "chamber": "senate",
    "district": 4,
    "name": "David R. Suetterlein"
  },
  {
    "lisId": "S0112",
    "chamber": "senate",
    "district": 5,
    "name": "T. Travis Hackworth"
  },
  {
    "lisId": "S0111",
    "chamber": "senate",
    "district": 6,
    "name": "Todd E. Pillion"
  },
  {
    "lisId": "S0082",
    "chamber": "senate",
    "district": 7,
    "name": "William M. Stanley Jr."
  },
  {
    "lisId": "S0105",
    "chamber": "senate",
    "district": 8,
    "name": "Mark J. Peake"
  },
  {
    "lisId": "S0131",
    "chamber": "senate",
    "district": 9,
    "name": "Tammy Brankley Mulchi"
  },
  {
    "lisId": "S0132",
    "chamber": "senate",
    "district": 10,
    "name": "Luther H. Cifers III"
  },
  {
    "lisId": "S0062",
    "chamber": "senate",
    "district": 11,
    "name": "R. Creigh Deeds"
  },
  {
    "lisId": "S0099",
    "chamber": "senate",
    "district": 12,
    "name": "Glen H. Sturtevant Jr."
  },
  {
    "lisId": "S0115",
    "chamber": "senate",
    "district": 13,
    "name": "Lashrecse D. Aird"
  },
  {
    "lisId": "S0114",
    "chamber": "senate",
    "district": 14,
    "name": "Lamont Bagby"
  },
  {
    "lisId": "S0134",
    "chamber": "senate",
    "district": 15,
    "name": "Michael J. Jones"
  },
  {
    "lisId": "S0129",
    "chamber": "senate",
    "district": 16,
    "name": "Schuyler T. VanValkenburg"
  },
  {
    "lisId": "S0116",
    "chamber": "senate",
    "district": 17,
    "name": "Emily M. Jordan"
  },
  {
    "lisId": "S0019",
    "chamber": "senate",
    "district": 18,
    "name": "L. Louise Lucas"
  },
  {
    "lisId": "S0118",
    "chamber": "senate",
    "district": 19,
    "name": "Christie New Craig"
  },
  {
    "lisId": "S0096",
    "chamber": "senate",
    "district": 20,
    "name": "Bill DeSteph"
  },
  {
    "lisId": "S0130",
    "chamber": "senate",
    "district": 21,
    "name": "Angelia Williams Graves"
  },
  {
    "lisId": "S0113",
    "chamber": "senate",
    "district": 22,
    "name": "Aaron R. Rouse"
  },
  {
    "lisId": "S0067",
    "chamber": "senate",
    "district": 23,
    "name": "Mamie E. Locke"
  },
  {
    "lisId": "S0119",
    "chamber": "senate",
    "district": 24,
    "name": "J.D. \"Danny\" Diggs"
  },
  {
    "lisId": "S0078",
    "chamber": "senate",
    "district": 25,
    "name": "Richard H. Stuart"
  },
  {
    "lisId": "S0069",
    "chamber": "senate",
    "district": 26,
    "name": "Ryan T. McDougle"
  },
  {
    "lisId": "S0120",
    "chamber": "senate",
    "district": 27,
    "name": "Tara A. Durant"
  },
  {
    "lisId": "S0088",
    "chamber": "senate",
    "district": 28,
    "name": "Bryce E. Reeves"
  },
  {
    "lisId": "S0098",
    "chamber": "senate",
    "district": 29,
    "name": "Jeremy S. McPike"
  },
  {
    "lisId": "S0126",
    "chamber": "senate",
    "district": 30,
    "name": "Danica A. Roem"
  },
  {
    "lisId": "S0125",
    "chamber": "senate",
    "district": 31,
    "name": "Russet W. Perry"
  },
  {
    "lisId": "S0133",
    "chamber": "senate",
    "district": 32,
    "name": "Kannan Srinivasan"
  },
  {
    "lisId": "S0117",
    "chamber": "senate",
    "district": 33,
    "name": "Jennifer D. Carroll Foy"
  },
  {
    "lisId": "S0100",
    "chamber": "senate",
    "district": 34,
    "name": "Scott A. Surovell"
  },
  {
    "lisId": "S0080",
    "chamber": "senate",
    "district": 35,
    "name": "David W. Marsden"
  },
  {
    "lisId": "S0124",
    "chamber": "senate",
    "district": 36,
    "name": "Stella G. Pekarsky"
  },
  {
    "lisId": "S0127",
    "chamber": "senate",
    "district": 37,
    "name": "Saddam Azlan Salim"
  },
  {
    "lisId": "S0106",
    "chamber": "senate",
    "district": 38,
    "name": "Jennifer B. Boysko"
  },
  {
    "lisId": "S0135",
    "chamber": "senate",
    "district": 39,
    "name": "Elizabeth Bennett-Parker"
  },
  {
    "lisId": "S0086",
    "chamber": "senate",
    "district": 40,
    "name": "Barbara A. Favola"
  }
];
