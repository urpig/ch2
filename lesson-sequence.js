// Public lesson numbers are independent of the saved-state IDs.
export const chapterSequence=[
 {id:'card-1',number:'序章',lessonId:1},
 {id:'forge-prep',number:'01'},
 {id:'metal-activity',number:'02'},
 {id:'card-2',number:'03A',lessonId:2},
 {id:'card-8',number:'03B',lessonId:8},
 {id:'oxide-stability',number:'04'},
 {id:'forge-prep-c',number:'05'},
 {id:'magnesium-co2',number:'05B'},
 {id:'life-redox',number:'06'},
 {id:'card-5',number:'07',lessonId:5},
 {id:'card-6',number:'08',lessonId:6},
 {id:'card-7',number:'09',lessonId:7}
];
export const chapterNumber=id=>chapterSequence.find(step=>step.id===id)?.number||'';
