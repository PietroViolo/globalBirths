#---------------------------------------------------------------------------#
# Nom : globaldeaths.R                                    			            #
# Description : Deaths per sec                                              #
# Auteur : Pietro Violo                                                     #
# Date : Jan 6 2025                                                         #
# Modifications :                                                           #
#---------------------------------------------------------------------------#
rm(list = ls())
options(scipen=999)

# Library
library(tidyverse)
library(sf)
library(rnaturalearth)


#---------------------------------------------------------------------------#
# Data
#---------------------------------------------------------------------------#

rm(list = ls())

# Import Kontour dataset
kontour_h3 <- st_read("./Data/kontur_population_20231101_r4.gpkg")

# Reproject to EPSG:4326
kontour_h3 <- st_transform(kontour_h3, crs = 4326)

# Load a world countries dataset
countries <- ne_countries(scale = "medium", returnclass = "sf")

# Perform the spatial join
kontour_h3 <- st_join(kontour_h3, countries[c("name", "iso_a3")])  # Use the 'name' column for country names


kontour_h3 %>% filter(iso_a3 == -99) %>% pull(name) %>% unique()

kontour_h3 <- kontour_h3 %>% mutate(iso_a3 = case_when(name == "France" ~ "FRA",
                                                       name == "Norway" ~ "NOR",
                                                       TRUE ~ iso_a3))


# Import mortality data
fertility_data <- read.csv("./Data/WPP2024_Demographic_Indicators_Medium.csv") %>% 
  select(ISO3_code,Births, Time) %>% 
  rename(iso_a3 = ISO3_code,
         Year = Time) %>% 
  filter(Year == 2024)


mortality_STATS <- read.csv("./Data/WPP2024_Demographic_Indicators_Medium.csv") %>% 
  rename(iso_a3 = ISO3_code,
         Year = Time) %>% 
  filter(Year == 2024)




kontour_h3 <- left_join(kontour_h3, fertility_data) 

# Compute centroids
kontour_h3$centroid <- st_centroid(kontour_h3$geom)

# Extract coordinates (longitude and latitude)
kontour_h3$longitude <- st_coordinates(kontour_h3$centroid)[, 1]  # X = Longitude
kontour_h3$latitude <- st_coordinates(kontour_h3$centroid)[, 2]

#---------------------------------------------------------------------------#
# Calculations
#---------------------------------------------------------------------------#

# The logic is as follows : Using the population density, we calculate the actual
# population given the area of the hexagon. We assume that deaths
# are also distributed according to the the distribution of the population
# So the most populated places will also have the most deaths.

kontour_h3_dist <- kontour_h3 %>% filter(!is.na(name) & !is.na(Births)) %>%  group_by(name) %>% 
  mutate(Total_density = sum(population),
         pct_density = population/Total_density) %>% 
  ungroup()



kontour_h3_dist <- kontour_h3_dist %>% mutate(Births = Births/(365.5*24) * 1000,
                                              Births = round(Births, 0))


df_points <- c()
country_name <- c()

countries <- kontour_h3_dist %>% pull(name) %>% unique()


for(country in countries){
 
   probabilities <- kontour_h3_dist %>% filter(name == country) %>% 
    select(h3, pct_density)
  
  # Number of units to distribute
  num_units <- kontour_h3_dist %>% filter(name == country) %>% pull(Births) %>% unique()
  
  for(i in 1:num_units){
    
    df_points <- c(df_points, sample(probabilities$h3, size = 1, prob = probabilities$pct_density))
    country_name <- c(country_name, country)
  }
  print(country)
}


# Create final dataset
# Apply random times between 1 and 20
# add country names

df_points <- cbind(df_points, country_name)

df_points <- df_points %>% as.data.frame()
colnames(df_points) <- c("h3","country")

df_points <- df_points %>%
  mutate(time = round(runif(min = 0, max = 60, n = nrow(df_points)), 2))


# left join coordinates

df_points <- left_join(df_points, kontour_h3_dist %>% select(h3, longitude, latitude))

# Add a random + 0.1
#df_points$longitude <- df_points$longitude + runif(nrow(df_points), -0.5, 0.5)
#df_points$latitude <- df_points$latitude + runif(nrow(df_points), -0.5, 0.5)

# Change time to hour forma
df_points <- df_points %>%
  mutate(formatted_time = sprintf("%02d:%02d", time %/% 60, time %% 60)) 

18823/60

df <- df_points %>% 
  select(longitude, latitude, time)

write.csv(df, file = "./Data/births.csv")

#---------------------------------------------------------------------------#
# Data viz
#---------------------------------------------------------------------------#
# Load necessary libraries
library(ggplot2)
library(gganimate)
library(maps)
library(ggfx) 

# Generate world map data
world_map <- map_data("world")

# Generate example x and y coordinates for 3600 iterations
set.seed(123)  # For reproducibility
iterations <- 500

# Add a column for opacity that fades as points age
coordinates$opacity <- 1

# Plot the world map and animate the glowing points
p <- ggplot() +
  # Draw the world map
  geom_polygon(data = world_map, aes(x = long, y = lat, group = group),
               fill = "lightblue", color = "gray") +
  
  # Add glowing points that persist
  with_outer_glow(
    geom_point(data = df_points,
               aes(x = longitude, y = latitude, group = time, frame_along = time),
               color = "red", size = 0.05, alpha = 0.4),
    colour = "red", sigma = 6
  ) +
  
  # Customize the appearance
  theme_minimal() +
  coord_fixed(ratio = 1.3) +
  labs(title = "Glowing Coordinate Animation", x = "Longitude", y = "Latitude")

# Animate the plot
animation <- p +
  transition_states(time, transition_length = 1, state_length = 1) +
  shadow_mark(alpha = 0.1, size = 0.05, colour = "red") +  # Persistent shadow with fading
  labs(title = "Minute: {closest_state}")

# Save or display the animation
animate(animation, nframes = iterations, fps = 30, width = 2000, height = 2000, end_pause = 10)


anim_save("persistent_glow_animation.gif", animation)


#---------------------------------------------------------------------------#
# Stats
#---------------------------------------------------------------------------#

# Import mortality data
fertility_data <- read.csv("./Data/WPP2024_Demographic_Indicators_Medium.csv") %>% 
  rename(iso_a3 = ISO3_code,
         Year = Time) %>% 
  filter(Year == 2024)


# 132405.927 births

wpp <- 132405.927 

# so


wpp
# around 15k per hour

15094.15/60


wpp <- 132405.927 * 1000

# so

wpp/(365.5*24)
# around 15k per hour

15094.15/60


continents <- continents %>% mutate(Births = Births * 1000/(365.5*24)/60) %>% filter(Location %in% c("Africa",
                                                                                       "Asia",
                                                                                       "Europe",
                                                                                       "Northern America",
                                                                                       "Latin America and the Caribbean",
                                                                                       "Oceania"))


