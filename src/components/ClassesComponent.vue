<template>
    <div class="search">
        <!-- Search input and lessons show if showCart false -->
        <div class="search-bar">
            <div class="search-input">
                <input :value="searchTerm" placeholder="Search Lessons.." @input="$emit('search', $event.target.value)">
            </div>
        </div>
        <ul>
            <!-- Filtered lessons -->
            <li v-for="lesson in lessons" :key="lesson.id">
                <div class="lesson-info">
                    <img :src="getLessonImage(lesson.title)" :alt="lesson.title + ' Icon'" class="lesson-icon">
                    <br>
                    <span>
                        <strong>{{ lesson.title }}</strong>
                        <br>
                        Location: <strong>{{ lesson.location }}</strong>
                        <br>
                        Price: <strong>£{{ lesson.price }}</strong>
                        <br>
                        Spaces: <strong>{{ lesson.spaces }}</strong>
                    </span>
                </div>
                <button @click="$emit('add', lesson)" :disabled="lesson.spaces === 0">Add to Cart</button>
            </li>
        </ul>
    </div>
</template>
  
<script>
export default {
    props: ['lessons', 'searchTerm'],
    methods: {

        // Get lesson image based on title
        getLessonImage(title) {
            const imgMap = {
                Maths: "math-icon.svg",
                History: "history-icon.svg",
                Science: "science-icon.svg",
                Art: "art-icon.svg",
                Music: "music-icon.svg",
                Programming: "programming-icon.svg",
                English: "english-icon.svg",
                PE: "PE-icon.svg",
                Chemistry: "chemistry-icon.svg",
                Geography: "geography-icon.svg",
            };
            return "https://afterschoolapp-env.eba-pyudtvba.us-east-1.elasticbeanstalk.com/images/" + imgMap[title] || "";
        },
    }
};
</script>
  