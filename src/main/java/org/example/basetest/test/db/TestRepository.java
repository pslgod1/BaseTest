package org.example.basetest.test.db;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TestRepository extends JpaRepository<TestEntity, Long> {

    @EntityGraph(attributePaths = {"questions","questions.answer"} )
    @Query("""
    SELECT t FROM TestEntity t
    WHERE t.id = :id
""")
    TestEntity findByIdWithQuestions(@Param("id") Long id);
}
