<?php
if (!defined('ABSPATH')) exit;

function ls_register_dynamic_tags($dynamic_tags)
{
    // Define the class inside the function to prevent "Class not found" errors
    class Lucas_CPT_Count_Dynamic_Tag extends \Elementor\Core\DynamicTags\Tag
    {
        public function get_name()
        {
            return 'lucas-cpt-count';
        }

        public function get_title()
        {
            return 'Post Count (Selector)';
        }

        public function get_group()
        {
            return 'site';
        }

        public function get_categories()
        {
            return [\Elementor\Modules\DynamicTags\Module::NUMBER_CATEGORY];
        }

        protected function register_controls()
        {
            $post_types = get_post_types(['public' => true], 'objects');
            $options = [];
            foreach ($post_types as $type) {
                $options[$type->name] = $type->label;
            }

            $this->add_control('cpt_slug', [
                'label'   => 'Select Post Type',
                'type'    => \Elementor\Controls_Manager::SELECT,
                'default' => 'post',
                'options' => $options,
            ]);
        }

        public function render()
        {
            $settings = $this->get_settings_for_display();
            $post_type = $settings['cpt_slug'] ?? 'post';

            $count = wp_count_posts($post_type);
            echo $count->publish ?? 0;
        }
    }

    // Register the tag
    $dynamic_tags->register(new \Lucas_CPT_Count_Dynamic_Tag());
}
